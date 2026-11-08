"""Sandbox helper. The agent's code runs `import hvac` and calls saturation_temp()."""
import csv
import os

_PT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pt-tables.csv")


def _normalize(refrigerant):
    """'r410a', 'R410A', '410a' and 'R-410A' all become 'R-410A'."""
    digits = "".join(c for c in str(refrigerant).upper() if c.isalnum()).removeprefix("R")
    return f"R-{digits}"


def _table(refrigerant):
    with open(_PT_FILE) as f:
        rows = [(float(r["psig"]), float(r["sat_temp_f"]))
                for r in csv.DictReader(f) if _normalize(r["refrigerant"]) == refrigerant]
    if not rows:
        raise ValueError(f"No PT table for {refrigerant}")
    return sorted(rows)


def saturation_temp(refrigerant, psig):
    """Saturation temperature in °F at a gauge pressure, by linear interpolation of pt-tables.csv."""
    ref = _normalize(refrigerant)
    rows = _table(ref)
    psig = float(psig)
    if not rows[0][0] <= psig <= rows[-1][0]:
        raise ValueError(f"{psig:g} psig is outside the {ref} table ({rows[0][0]:g}-{rows[-1][0]:g})")
    for (p1, t1), (p2, t2) in zip(rows, rows[1:]):
        if p1 <= psig <= p2:
            return t1 + (psig - p1) * (t2 - t1) / (p2 - p1)
    return rows[-1][1]  # psig equals the last row


if __name__ == "__main__":
    t = saturation_temp("R-410A", 105)
    assert abs(t - 34) <= 1, t
    assert abs((60 - t) - 26) <= 2
    assert saturation_temp("r410a", 96.8) == 30
    print(f"ok: R-410A at 105 psig = {t:.1f}°F")
