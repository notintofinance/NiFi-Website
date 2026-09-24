"""SEC EDGAR filings for a configured watchlist (submissions JSON).

Endpoint (documented at https://www.sec.gov/search-filings/edgar-application-programming-interfaces):
    https://data.sec.gov/submissions/CIK##########.json
Access: no key. SEC fair-access policy requires a descriptive User-Agent that
includes a contact e-mail, and at most 10 requests/second.
Terms: EDGAR filings are public.

What is ingested: form type, 8-K item codes, company, filing time and link. No
filing text. The 8-K item codes are the company's own statement of what the
filing is about, which gives a deterministic event type (config/event_rules.yaml).

Point-in-time: acceptanceDateTime is published with a "Z" suffix but appears to
be US Eastern time. It is interpreted in `acceptance_timezone` (default
America/New_York). This is the conservative choice: if the values were truly
UTC, reading them as Eastern places filings 4–5 hours LATER than reality, which
delays knowledge but can never create look-ahead. Verify against a filing index
page ("Accepted") and record the result in docs/SOURCES.md.
"""
from __future__ import annotations

import json
import time
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from mie.core.enums import DocumentType
from mie.core.schemas import NormalizedDocument, RawPayload
from mie.ingestion.base import HttpFetcher, ParseError, SourceConnector

SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
FILING_URL = "https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{doc}"

# Official Form 8-K item titles (abbreviated where the official title is very long).
ITEM_TITLES = {
    "1.01": "Entry into a Material Definitive Agreement",
    "1.02": "Termination of a Material Definitive Agreement",
    "1.03": "Bankruptcy or Receivership",
    "1.05": "Material Cybersecurity Incidents",
    "2.01": "Completion of Acquisition or Disposition of Assets",
    "2.02": "Results of Operations and Financial Condition",
    "2.03": "Creation of a Direct Financial Obligation",
    "2.04": "Triggering Events That Accelerate or Increase a Direct Financial Obligation",
    "2.05": "Costs Associated with Exit or Disposal Activities",
    "2.06": "Material Impairments",
    "3.01": "Notice of Delisting or Failure to Satisfy a Continued Listing Rule",
    "3.02": "Unregistered Sales of Equity Securities",
    "3.03": "Material Modification to Rights of Security Holders",
    "4.01": "Changes in Registrant's Certifying Accountant",
    "4.02": "Non-Reliance on Previously Issued Financial Statements",
    "5.01": "Changes in Control of Registrant",
    "5.02": "Departure or Appointment of Directors or Certain Officers",
    "5.03": "Amendments to Articles of Incorporation or Bylaws; Change in Fiscal Year",
    "5.07": "Submission of Matters to a Vote of Security Holders",
    "7.01": "Regulation FD Disclosure",
    "8.01": "Other Events",
    "9.01": "Financial Statements and Exhibits",
}
FORM_TITLES = {"10-Q": "quarterly report", "10-K": "annual report"}


class SecEdgarConnector(SourceConnector):
    fixture_files = ("sec_submissions.synthetic.json",)

    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        ua = http.client.headers.get("User-Agent", "")
        if "@" not in ua:
            raise ValueError("SEC requires a User-Agent with a contact e-mail: set HTTP_USER_AGENT in .env")
        payloads = []
        for i, company in enumerate(self.options.get("watchlist", [])):
            if i:
                time.sleep(0.2)  # well under the 10 requests/second fair-access limit
            url = SUBMISSIONS_URL.format(cik=int(company["cik"]))
            resp = http.request("GET", url)
            payloads.append(RawPayload(source_key=self.spec.key, content=resp.content,
                                       content_type=resp.headers.get("content-type"),
                                       fetched_at=datetime.now(timezone.utc), request_meta={"url": url}))
        return payloads

    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        try:
            data = json.loads(payload.content)
            recent = data["filings"]["recent"]
            cik = int(data["cik"])
        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
            raise ParseError(f"unexpected EDGAR submissions format: {exc!r}") from exc
        forms_wanted = set(self.options.get("forms", ["8-K", "10-Q", "10-K"]))
        tz = ZoneInfo(self.options.get("acceptance_timezone", "America/New_York"))
        cutoff = payload.fetched_at - timedelta(days=int(self.options.get("lookback_days", 30)))
        name = data.get("name", f"CIK {cik}")
        ticker = (data.get("tickers") or [None])[0]
        who = f"{name} ({ticker})" if ticker else name
        columns = ("accessionNumber", "form", "acceptanceDateTime", "items", "primaryDocument", "reportDate")
        n = len(recent.get("accessionNumber", []))
        docs = []
        for i in range(n):
            row = {c: (recent.get(c) or [None] * n)[i] for c in columns}
            if row["form"] not in forms_wanted or not row["accessionNumber"]:
                continue
            accepted = _parse_acceptance(row["acceptanceDateTime"], tz)
            if accepted is not None and accepted < cutoff:
                continue
            items = [x.strip() for x in (row["items"] or "").split(",") if x.strip()]
            if row["form"].startswith("8-K"):
                parts = [f"Item {c} {ITEM_TITLES.get(c, '')}".strip() for c in items]
                headline = f"{who} files Form {row['form']}: " + ("; ".join(parts) or "no items listed")
            else:
                headline = (f"{who} files Form {row['form']} ({FORM_TITLES.get(row['form'], 'filing')})"
                            + (f" for period {row['reportDate']}" if row["reportDate"] else ""))
            base_form = row["form"].split("/")[0]
            categories = [f"Form {base_form}"] + [f"{base_form} Item {c}" for c in items]
            acc_nodash = row["accessionNumber"].replace("-", "")
            docs.append(NormalizedDocument(
                external_id=row["accessionNumber"],
                source_key=self.spec.key,
                document_type=DocumentType.FILING,
                language="en",
                headline=headline,
                body="",
                url=FILING_URL.format(cik=cik, acc=acc_nodash, doc=row["primaryDocument"] or ""),
                published_at=accepted,
                retrieved_at=payload.fetched_at,
                raw_metadata={"categories": categories, "cik": cik, "company": name, "ticker": ticker,
                              "form": row["form"], "items": items, "report_date": row["reportDate"],
                              "acceptance_raw": row["acceptanceDateTime"], "acceptance_timezone": str(tz)},
            ))
        return docs


def _parse_acceptance(raw: str | None, tz: ZoneInfo) -> datetime | None:
    """'2026-09-10T16:31:05.000Z' -> that wall-clock time in `tz`, converted to UTC."""
    if not raw:
        return None
    try:
        naive = datetime.strptime(raw.rstrip("Z").split(".")[0], "%Y-%m-%dT%H:%M:%S")
    except ValueError:
        return None
    return naive.replace(tzinfo=tz).astimezone(timezone.utc)
