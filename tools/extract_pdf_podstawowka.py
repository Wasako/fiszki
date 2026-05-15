#!/usr/bin/env python3
"""Ekstrakcja tekstu z wzory fizyka - podstawowka.pdf."""
from __future__ import annotations

import fitz
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "wzory fizyka - podstawowka.pdf"
OUT = ROOT / "tools" / "_pdf_podstawowka_raw.txt"


def main() -> None:
    doc = fitz.open(PDF)
    parts: list[str] = []
    for i in range(doc.page_count):
        parts.append(f"===== PAGE {i + 1} =====\n\n")
        parts.append(doc.load_page(i).get_text())
        parts.append("\n")
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} ({doc.page_count} pages, {OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
