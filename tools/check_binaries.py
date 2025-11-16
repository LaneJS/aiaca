#!/usr/bin/env python3
"""Fail the build if tracked files look binary.

Checks git-tracked files for null bytes or banned binary extensions so we
avoid pushing binaries that hosting providers reject.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BANNED_EXTENSIONS = {
    ".ico",
    ".jar",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".pdf",
    ".zip",
    ".gz",
    ".tar",
    ".rar",
    ".7z",
    ".bmp",
    ".psd",
    ".exe",
    ".dll",
    ".svgz",
}


def list_tracked_files() -> list[str]:
    result = subprocess.check_output(["git", "ls-files"], cwd=REPO_ROOT)
    return result.decode().splitlines()


def is_banned_extension(path: Path) -> bool:
    return path.suffix.lower() in BANNED_EXTENSIONS


def has_null_bytes(path: Path) -> bool:
    with path.open("rb") as handle:
        sample = handle.read(8192)
    return b"\0" in sample


def main() -> int:
    failures: list[tuple[str, str]] = []

    for relative in list_tracked_files():
        path = REPO_ROOT / relative

        if is_banned_extension(path):
            failures.append((relative, "banned extension"))
            continue

        if has_null_bytes(path):
            failures.append((relative, "contains null bytes"))

    if failures:
        print("Binary-like files detected (remove or replace before committing):")
        for file, reason in failures:
            print(f" - {file}: {reason}")
        return 1

    print("No binary-like tracked files found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
