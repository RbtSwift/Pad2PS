#!/usr/bin/env python3

import sys
from datetime import datetime, timezone
from pathlib import Path


def debian_date() -> str:
    return datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: generate_debian_changelog.py VERSION NOTES_MD OUTPUT_FILE", file=sys.stderr)
        return 2

    version = sys.argv[1].lstrip("v")
    notes = Path(sys.argv[2]).read_text(encoding="utf-8")
    output = Path(sys.argv[3])

    bullets = []
    in_portuguese = False
    for line in notes.splitlines():
        stripped = line.strip()
        if stripped == "## Português (Brasil)":
            in_portuguese = True
            continue
        if stripped == "## English":
            in_portuguese = False
            continue
        if in_portuguese and stripped.startswith("- "):
            bullets.append(stripped[2:].strip())

    if not bullets:
        bullets = ["Atualização oficial do Pad2PS."]

    lines = [
        f"pad2ps ({version}) stable; urgency=medium",
        "",
    ]
    lines.extend(f"  * {bullet}" for bullet in bullets)
    lines.extend([
        "",
        " -- Pad2PS (Ravi Rosa) <contato@pad2ps.com.br>  " + debian_date(),
        "",
    ])
    output.write_text("\n".join(lines), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
