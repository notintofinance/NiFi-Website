from datetime import datetime, timedelta, timezone

import pytest

from mie.db.models import Event, EventDocument
from mie.processing.dedup import CandidateEvent, LexicalCosine, calibrate_threshold, decide
from mie.processing.event_extractor import EventExtractor

T0 = datetime(2026, 9, 16, 18, tzinfo=timezone.utc)
W = timedelta(hours=72)


def _cand(**kw):
    base = dict(event_id=1, event_type="MONETARY_POLICY", event_time=T0, entity_keys=frozenset({"FED"}),
                document_texts=("Federal Reserve issues FOMC statement lowering the federal funds rate target range",))
    base.update(kw)
    return CandidateEvent(**base)


TEXT = "Fed cuts federal funds rate target range, FOMC statement says"


def test_same_event_attaches():
    d = decide(TEXT, "MONETARY_POLICY", frozenset({"FED"}), T0, [_cand()], LexicalCosine(), 0.2, W)
    assert d.event_id == 1 and d.similarity >= 0.2


def test_different_event_type_never_attaches():
    d = decide(TEXT, "REGULATION", frozenset({"FED"}), T0, [_cand()], LexicalCosine(), 0.0, W)
    assert d.event_id is None and d.similarity is None


def test_outside_window_never_attaches():
    d = decide(TEXT, "MONETARY_POLICY", frozenset({"FED"}), T0 + timedelta(days=5), [_cand()],
               LexicalCosine(), 0.0, W)
    assert d.event_id is None


def test_disjoint_entities_never_attach():
    d = decide(TEXT, "MONETARY_POLICY", frozenset({"BI"}), T0, [_cand()], LexicalCosine(), 0.0, W)
    assert d.event_id is None


def test_similarity_is_deterministic():
    b = LexicalCosine()
    assert b.similarities("a b c", ["a b d"]) == LexicalCosine().similarities("a b c", ["a b d"])


def test_fixture_pipeline_dedups(loaded):
    events = loaded.query(Event).all()
    assert len(events) == 6
    fomc = next(e for e in events if e.title.endswith("Federal Reserve issues FOMC statement"))
    assert len(fomc.documents) == 2  # statement + implementation note = one underlying event
    cpi = loaded.query(Event).filter(Event.event_key == "US_CPI:2026-08").one()
    assert len(cpi.documents) == 2 and cpi.dedup_method == "NATURAL_KEY"  # headline + core series
    assert all(st.value is not None for st in cpi.statements)


def test_reprocessing_is_idempotent(loaded, settings):
    before = loaded.query(EventDocument).count()
    stats = EventExtractor(loaded, settings).process_pending()
    assert stats.documents == 0 and loaded.query(EventDocument).count() == before


def test_layers_are_separated(loaded):
    fomc = next(e for e in loaded.query(Event).all() if e.title.endswith("FOMC statement"))
    layers = {st.text: st.layer for st in fomc.statements}
    assert layers["The Committee judges that downside risks to employment have increased."] == "MANAGEMENT"
    assert layers["Inflation has moved closer to the Committee's 2 percent objective."] == "FACTUAL"


def test_calibrate_threshold_maximises_f1():
    scores = [0.9, 0.8, 0.6, 0.5, 0.3, 0.1]
    labels = [True, True, True, False, False, False]
    r = calibrate_threshold(scores, labels)
    assert r["threshold"] == 0.6 and r["f1"] == 1.0 and r["n_pairs"] == 6


def test_calibrate_threshold_needs_positives():
    with pytest.raises(ValueError):
        calibrate_threshold([0.1], [False])
