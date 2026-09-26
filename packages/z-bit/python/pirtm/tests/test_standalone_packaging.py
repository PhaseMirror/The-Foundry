"""Regression tests for PIRTM standalone packaging metadata.

These tests lock the packaging boundary so publishing/installing PIRTM does
not accidentally pull unrelated workspace packages.
"""

from __future__ import annotations

import ast
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SETUP_PY = REPO_ROOT / "setup.py"
PYPROJECT_TOML = REPO_ROOT / "pyproject.toml"


def _find_setup_call(tree: ast.AST) -> ast.Call:
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "setup":
            return node
    raise AssertionError("setup(...) call not found in setup.py")


def _extract_packages_call(setup_call: ast.Call) -> ast.Call:
    for keyword in setup_call.keywords:
        if keyword.arg == "packages" and isinstance(keyword.value, ast.Call):
            return keyword.value
    raise AssertionError("setup(..., packages=...) not found or not a function call")


def test_pyproject_build_backend_present() -> None:
    text = PYPROJECT_TOML.read_text(encoding="utf-8")
    assert "[build-system]" in text
    assert "build-backend = \"setuptools.build_meta\"" in text
    assert "setuptools" in text


def test_setup_packages_are_scoped_to_pirtm_namespace() -> None:
    tree = ast.parse(SETUP_PY.read_text(encoding="utf-8"), filename=str(SETUP_PY))
    setup_call = _find_setup_call(tree)
    packages_call = _extract_packages_call(setup_call)

    assert isinstance(packages_call.func, ast.Name)
    assert packages_call.func.id == "find_packages", "packages= must use find_packages(...)"

    include_kw = None
    for keyword in packages_call.keywords:
        if keyword.arg == "include":
            include_kw = keyword
            break

    assert include_kw is not None, "find_packages must provide include=[...] for namespace scoping"
    assert isinstance(include_kw.value, ast.List)

    include_values = []
    for elt in include_kw.value.elts:
        assert isinstance(elt, ast.Constant) and isinstance(elt.value, str)
        include_values.append(elt.value)

    assert include_values == ["pirtm", "pirtm.*"], (
        "Standalone PIRTM packaging must only include the pirtm namespace"
    )


def test_setup_long_description_uses_pirtm_readme() -> None:
    text = SETUP_PY.read_text(encoding="utf-8")
    assert 'readme_path = Path(__file__).parent / "pirtm" / "README.md"' in text
