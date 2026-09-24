"""Pre-flight review of what the Claude stage would send. Makes no network call.

Use it to approve the data flow before enabling CLAUDE_ENABLED: it shows, per
event, whether it would be sent and why not, and the exact request body.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.config import Settings, claude_kwargs
from mie.db.models import ModelVersion
from mie.intelligence.service import eligible_briefs
from mie.models.claude import ClaudeClassifier


def claude_preview(session: Session, settings: Settings, event_ids: list[int] | None = None,
                   clf: ClaudeClassifier | None = None, as_of: datetime | None = None) -> dict:
    clf = clf or ClaudeClassifier(**claude_kwargs(settings), client=object())  # never called
    as_of = as_of or datetime.now(timezone.utc)
    mv = session.scalar(select(ModelVersion).where(ModelVersion.name == clf.model,
                                                   ModelVersion.version == clf.model))  # read-only lookup
    events = []
    for event, brief, status in eligible_briefs(session, settings, clf, mv.id if mv else None, event_ids, as_of):
        item = {
            "event_id": event.id, "title": event.title, "event_type": event.event_type, "status": status,
            "excluded_after_as_of": brief.excluded_after_as_of,
            "excluded_not_permitted": brief.excluded_not_permitted,
            "omitted_over_cap": brief.omitted_statements,
        }
        if status == "SEND":
            user = clf.build_user_message(brief)
            item["user_message"] = user
            item["user_message_chars"] = len(user)
        events.append(item)
    return {
        "claude_enabled": settings.claude_enabled,
        "model": clf.model,
        "backend": clf.call.backend,
        "prompt_version": clf.prompt_version,
        "as_of": as_of.isoformat(),
        "system_prompt": clf.system_prompt,
        "system_prompt_chars": len(clf.system_prompt),
        "output_schema": clf.schema,
        "events": events,
        "would_send": sum(1 for e in events if e["status"] == "SEND"),
    }
