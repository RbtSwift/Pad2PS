#!/bin/bash
export TMPDIR="${XDG_RUNTIME_DIR}/app/${FLATPAK_ID:-io.github.rbtswift.Pad2PS}"
mkdir -p "$TMPDIR"
exec /app/opt/Pad2PS/pad2ps --no-sandbox "$@"
