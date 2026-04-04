#!/usr/bin/env python3
"""Build en.json and sq.json for Laravel WordImportService from project assets."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "backend" / "resources" / "dictionaries"


def php_normalize(word: str) -> str:
    return word.strip().upper().replace("Ë", "E").replace("Ç", "C")


def albanian_headword(term: str) -> str | None:
    term = (term or "").strip()
    m = re.match(r"^([A-Za-zÇçËë']+)", term)
    return m.group(1) if m else None


def build_albanian() -> list[str]:
    dict_path = ROOT / "dictionary.json"
    with dict_path.open(encoding="utf-8") as f:
        data = json.load(f)

    def pick_better(current: str, incoming: str) -> str:
        def score(s: str) -> tuple[int, int]:
            has_diac = 1 if ("Ë" in s or "Ç" in s) else 0
            return (has_diac, len(s))

        return incoming if score(incoming) > score(current) else current

    by_normalized: dict[str, str] = {}
    for item in data:
        hw = albanian_headword(item.get("term", ""))
        if not hw:
            continue
        normalized = php_normalize(hw)
        if len(normalized) != 5 or not normalized.isalpha():
            continue
        display = hw.upper()
        if normalized not in by_normalized:
            by_normalized[normalized] = display
        else:
            by_normalized[normalized] = pick_better(by_normalized[normalized], display)

    return sorted(by_normalized.values())


def load_dwyl_words_alpha() -> set[str]:
    """Optional large English list (5-letter, a–z only). Cached under scripts/cache."""
    cache = ROOT / "scripts" / "cache" / "words_alpha.txt"
    url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url, timeout=120) as resp:
            cache.write_bytes(resp.read())

    words: set[str] = set()
    for line in cache.read_text(encoding="utf-8", errors="replace").splitlines():
        w = line.strip().lower()
        if len(w) == 5 and w.isalpha():
            words.add(w.upper())
    return words


def build_english() -> list[str]:
    words: set[str] = set()
    wl = ROOT / "public" / "assets" / "combined_wordlist.txt"
    for line in wl.read_text(encoding="utf-8").splitlines():
        w = line.strip().lower()
        if len(w) == 5 and w.isalpha():
            words.add(w.upper())

    # Merge shorter curated list (some overlap)
    en_json = ROOT / "public" / "dictionary-en.json"
    if en_json.exists():
        payload = json.loads(en_json.read_text(encoding="utf-8"))
        for w in payload.get("words", []):
            if not isinstance(w, str):
                continue
            u = w.strip().upper()
            nu = php_normalize(u)
            if len(nu) == 5 and nu.isalpha():
                words.add(u)

    try:
        words |= load_dwyl_words_alpha()
    except OSError as e:
        print(f"Warning: could not load dwyl words_alpha ({e}); using smaller English set only.")

    return sorted(words)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    en_words = build_english()
    sq_words = build_albanian()

    (OUT_DIR / "en.json").write_text(
        json.dumps(en_words, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "sq.json").write_text(
        json.dumps(sq_words, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(en_words)} English words -> {OUT_DIR / 'en.json'}")
    print(f"Wrote {len(sq_words)} Albanian words -> {OUT_DIR / 'sq.json'}")


if __name__ == "__main__":
    main()
