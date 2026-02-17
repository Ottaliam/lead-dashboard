"""
Merge DSMI and LSLR xlsx files on PWSID (Public Water Supply ID).

Follow-up to fetch_data.py. Reads the two xlsx files from data/, merges on
Public Water Supply ID (PWSID), and keeps all records (outer join).

Both files use: header in row 3 (0-indexed: 2), data from row 4 onward.
"""

import os

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# File names (must match fetch_data.py outputs)
DSMI_FILE = "DSMI-Service-Line-Materials-Estimates.xlsx"
LSLR_FILE = "2024-2025-LSLR-Data.xlsx"
OUTPUT_FILE = "DSMI-LSLR-Merged.xlsx"

# Both xlsx: header row index 2 (3rd row), data begins row 3 (4th row)
HEADER_ROW = 2


def load_dsmi(path: str) -> pd.DataFrame:
    """Load DSMI file with header on row 3, data from row 4."""
    df = pd.read_excel(path, header=HEADER_ROW)
    return _normalize_pwsid(df)


def load_lslr(path: str) -> pd.DataFrame:
    """Load LSLR file with header on row 3, data from row 4."""
    df = pd.read_excel(path, header=HEADER_ROW)
    return _normalize_pwsid(df)


def _normalize_pwsid(df: pd.DataFrame) -> pd.DataFrame:
    """Strip whitespace from PWSID column for reliable matching."""
    key_col = "Public Water Supply ID"
    if key_col in df.columns:
        df = df.copy()
        df[key_col] = df[key_col].astype(str).str.strip()
    return df


def merge_on_pwsid(dsmi: pd.DataFrame, lslr: pd.DataFrame) -> pd.DataFrame:
    """
    Merge DSMI and LSLR on Public Water Supply ID (PWSID).
    Uses outer join to keep all records from both files.
    """
    key_col = "Public Water Supply ID"

    # Rename overlapping columns (Supply Name) to avoid collision
    dsmi_merged = dsmi.rename(columns={"Supply Name": "DSMI_Supply_Name"}) if "Supply Name" in dsmi.columns else dsmi
    lslr_merged = lslr.rename(columns={"Supply Name": "LSLR_Supply_Name"}) if "Supply Name" in lslr.columns else lslr

    merged = pd.merge(dsmi_merged, lslr_merged, on=key_col, how="outer")
    return merged


def main():
    dsmi_path = os.path.join(DATA_DIR, DSMI_FILE)
    lslr_path = os.path.join(DATA_DIR, LSLR_FILE)
    output_path = os.path.join(DATA_DIR, OUTPUT_FILE)

    if not os.path.exists(dsmi_path):
        raise FileNotFoundError(f"DSMI file not found: {dsmi_path}. Run fetch_data.py first.")
    if not os.path.exists(lslr_path):
        raise FileNotFoundError(f"LSLR file not found: {lslr_path}. Run fetch_data.py first.")

    print("Loading DSMI...")
    dsmi = load_dsmi(dsmi_path)
    print(f"  {len(dsmi)} rows")

    print("Loading LSLR...")
    lslr = load_lslr(lslr_path)
    print(f"  {len(lslr)} rows")

    print("Merging on Public Water Supply ID (outer join)...")
    merged = merge_on_pwsid(dsmi, lslr)
    print(f"  {len(merged)} rows (all records kept)")

    print(f"Writing {OUTPUT_FILE}...")
    merged.to_excel(output_path, index=False)
    print(f"Done. Output: {output_path}")


if __name__ == "__main__":
    main()
