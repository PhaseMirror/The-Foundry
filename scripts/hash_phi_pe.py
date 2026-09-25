#!/usr/bin/env python3
"""Phi-Psi-Epsilon (PhiPe) codec gate. Reference implementation of CANON-JSON-SHA256-v1.

Verifies:
  1. codecHash of docs/specs/phi-pe.codec.json (file minus x-codec.hash) equals the pinned value.
  2. kernelHash of the example document equals the pinned value.
  3. Three chart files share one kernelHash and contain only allowed keys.
  4. The example document validates; the three reject fixtures fail.
  5. With --strict and jsonschema installed: schema-level validation is enforced.

Exit code is nonzero on any failure. Run from packages/Foundry:
    PYTHONPATH=/path/to/jsonschema python3 scripts/hash_phi_pe.py [--strict]
"""
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPECS = ROOT / "docs" / "specs"
CODEC = SPECS / "phi-pe.codec.json"
CHARTS_DIR = SPECS / "phi-pe.charts"
FIXTURES_DIR = SPECS / "phi-pe.fixtures"

CHART_IDS = ["consciousness", "economics", "biology"]
KERNEL_HASH_KEYS = ("version", "dialect", "kernel")
KERNEL_KEYS = {"gamma", "lambda", "psi", "omega", "p", "n", "thetaPrev", "t", "doorMode"}
BINDING_KEYS = {"n", "thetaPrev", "p", "t", "doorMode"}
CHART_FILE_KEYS = {"schema", "chartFileId", "kernelHash", "bindings"}


def canon(obj):
    """CANON-JSON-SHA256-v1: UTF-8 byte-sorted keys, ensure_ascii=false, (',', ':'), no newline."""
    if isinstance(obj, dict):
        items = sorted(obj.items(), key=lambda kv: kv[0].encode("utf-8"))
        return "{" + ",".join(_quote(k) + ":" + canon(v) for k, v in items) + "}"
    if isinstance(obj, list):
        return "[" + ",".join(canon(x) for x in obj) + "]"
    if isinstance(obj, str):
        return _quote(obj)
    if obj is True:
        return "true"
    if obj is False:
        return "false"
    if obj is None:
        return "null"
    if isinstance(obj, int):
        return str(obj)
    if isinstance(obj, float):
        raise ValueError("floating point forbidden (ADR-0021)")
    raise TypeError(f"unsupported type {type(obj).__name__}")


def _quote(s):
    return json.dumps(s, ensure_ascii=False, separators=(",", ":"))


def digest(obj):
    return hashlib.sha256(canon(obj).encode("utf-8")).hexdigest()


def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def check(name, cond, detail=""):
    if not cond:
        print(f"FAIL {name}: {detail}")
        return False
    return True


def load_schema(codec):
    return {k: v for k, v in codec.items() if not k.startswith("x-")}


def validate(instance, schema, ref=None):
    import jsonschema

    jsonschema.validate(instance, schema)
    return True


def main():
    strict = "--strict" in sys.argv
    failures = 0

    codec = load(CODEC)
    pinned_codec = codec["x-codec"]["hash"]["codecHash"]
    pinned_kernel = codec["x-codec"]["hash"]["example"]["kernelHash"]

    import copy

    cc = copy.deepcopy(codec)
    cc["x-codec"].pop("hash")
    computed_codec = digest(cc)
    failures += not check(
        "codecHash", computed_codec == pinned_codec,
        f"computed {computed_codec} != pinned {pinned_codec}",
    )

    example = load(FIXTURES_DIR / "example.json")["document"]
    computed_kernel = digest({k: example[k] for k in KERNEL_HASH_KEYS})
    failures += not check(
        "example kernelHash", computed_kernel == pinned_kernel,
        f"computed {computed_kernel} != pinned {pinned_kernel}",
    )

    charts = {}
    for cid in CHART_IDS:
        p = CHARTS_DIR / f"{cid}.json"
        chart = load(p)
        schema_ok = set(chart.keys()) == CHART_FILE_KEYS
        bind_ok = set(chart["bindings"].keys()) == BINDING_KEYS
        charts[cid] = chart
        failures += not check(
            f"chart {cid} keys", schema_ok and bind_ok,
            f"schema keys {set(chart.keys())}, binding keys {set(chart['bindings'].keys())}",
        )

    c0 = charts[CHART_IDS[0]]["kernelHash"]
    failures += not check(
        "charts share kernelHash",
        all(charts[c]["kernelHash"] == c0 for c in CHART_IDS) and c0 == pinned_kernel,
        f"{ {c: charts[c]['kernelHash'] for c in CHART_IDS} } != {pinned_kernel}",
    )

    schema = load_schema(codec)
    if strict:
        try:
            import jsonschema
        except ImportError:
            print("strict requested but jsonschema not importable")
            return 2

        base = jsonschema.Draft202012Validator(schema)
        try:
            base.validate(example)
            print("OK   example.json validates")
        except Exception as e:
            failures += 1
            print(f"FAIL example validation: {e}")

        chart_validator = base.evolve(schema={"$ref": "#/$defs/chartFile"})
        for cid in CHART_IDS:
            try:
                chart_validator.validate(charts[cid])
                print(f"OK   chart {cid}.json validates")
            except Exception as e:
                failures += 1
                print(f"FAIL chart {cid} validation: {e}")

        rejects = [
            ("reject-third-door.json", "third door"),
            ("reject-m-binding.json", "M binding"),
            ("reject-speaker-in-kernel.json", "speaker in kernel"),
        ]
        for fname, label in rejects:
            inst = load(FIXTURES_DIR / fname)["document"]
            try:
                base.validate(inst)
                failures += 1
                print(f"FAIL {fname}: {label} was accepted")
            except Exception as e:
                print(f"OK   {fname}: {label} rejected ({e.message[:60]})")

    else:
        struct_ok = (
            set(example["kernel"].keys()) == KERNEL_KEYS
            and set(example["bindings"].keys()) == BINDING_KEYS
            and set(example["meta"].keys()) == {"chartFileId", "attribution"}
        )
        failures += not check("example structure", struct_ok)
        t = load(FIXTURES_DIR / "reject-third-door.json")["document"]
        failures += not check(
            "reject third door (structure)",
            "thirdDoor" in t["kernel"],
            "thirdDoor missing from fixture",
        )
        m = load(FIXTURES_DIR / "reject-m-binding.json")["document"]
        failures += not check(
            "reject M binding (structure)", "Mscale" in m["bindings"],
            "Mscale missing from fixture",
        )
        s = load(FIXTURES_DIR / "reject-speaker-in-kernel.json")["document"]
        failures += not check(
            "reject speaker in kernel (structure)", "speaker" in s["kernel"],
            "speaker missing from fixture",
        )

    print(f"computed codecHash  {computed_codec}")
    print(f"computed kernelHash {computed_kernel}")
    print("PASS" if failures == 0 else f"FAILURES={failures}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())