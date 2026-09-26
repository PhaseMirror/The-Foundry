"""Backward-compatible ADR/transpiler exports.

This shim preserves older import paths used by adjacent stack modules while the
transpiler surface continues to evolve.
"""

from importlib import import_module

__all__ = [
    "PirtmLinkWithEnsemble",
    "link_pirtm_modules",
    "print_link_report",
]


def _load_link_ensemble_module():
    return import_module("meta_ensembles.core.pirtm_link_ensemble")


def link_pirtm_modules(*args, **kwargs):
    return _load_link_ensemble_module().link_pirtm_modules(*args, **kwargs)


def print_link_report(*args, **kwargs):
    return _load_link_ensemble_module().print_link_report(*args, **kwargs)


def __getattr__(name: str):
    if name == "PirtmLinkWithEnsemble":
        value = _load_link_ensemble_module().PirtmLinkWithEnsemble
        globals()[name] = value
        return value
    if name in {"link_pirtm_modules", "print_link_report"}:
        return globals()[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")