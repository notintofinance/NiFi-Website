"""Small persistence helpers shared by the engines."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.schemas import SourceSpec
from mie.db.models import ModelVersion, Source


def upsert_source(session: Session, spec: SourceSpec) -> Source:
    src = session.scalar(select(Source).where(Source.key == spec.key))
    if src is None:
        src = Source(key=spec.key)
        session.add(src)
    src.name = spec.name
    src.source_type = spec.source_type.value
    src.country = spec.country
    src.base_url = spec.base_url
    src.access_method = spec.access_method
    src.licence_note = spec.licence_note
    src.allow_external_llm = spec.allow_external_llm
    src.is_fixture = spec.is_fixture
    session.flush()
    return src


def get_or_create_model_version(session: Session, name: str, version: str, kind: str,
                                config: dict | None = None) -> ModelVersion:
    mv = session.scalar(select(ModelVersion).where(ModelVersion.name == name, ModelVersion.version == version))
    if mv is None:
        mv = ModelVersion(name=name, version=version, kind=kind, config=config or {})
        session.add(mv)
        session.flush()
    return mv
