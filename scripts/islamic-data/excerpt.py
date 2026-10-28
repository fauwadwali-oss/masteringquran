"""Exact-excerpt helpers shared by build_duas.py and build_adhkar.py.

A text is cut out of its source with a pair of markers ("from" and "to", inclusive).
Arabic markers are matched without diacritics, so they can be typed plainly.
Every helper fails the build when a marker is missing or ambiguous.
"""
import re

MARKS = re.compile("[ؐ-ًؚ-ٰٟۖ-ۭـ‏‎]")
# Letter variants that differ between editions: alif forms, and final ya written with or without dots.
ALIF = {"\u0671": "\u0627", "\u0623": "\u0627", "\u0625": "\u0627", "\u0622": "\u0627", "\u0649": "\u064A"}


def bare_with_map(text: str):
    """Text without diacritics, plus the original index of every kept character."""
    out, idx = [], []
    for i, ch in enumerate(text):
        if MARKS.match(ch):
            continue
        out.append(ALIF.get(ch, ch))
        idx.append(i)
    return "".join(out), idx


def cut_arabic(text: str, marker: dict, where: str) -> str:
    b, idx = bare_with_map(text)
    frm, to = bare_with_map(marker["from"])[0], bare_with_map(marker.get("to", marker["from"]))[0]
    if frm not in b or (b.count(frm) != 1 and not marker.get("first")):
        raise SystemExit(f"{where}: Arabic 'from' found {b.count(frm)} times: {frm}\n  bare: {b}")
    s = b.index(frm)
    e = b.find(to, s if to != frm else s)
    if e < 0:
        raise SystemExit(f"{where}: Arabic 'to' not found after 'from': {to}\n  bare: {b[s:]}")
    e_bare = e + len(to) - 1
    start, end = idx[s], idx[e_bare] + 1
    while end < len(text) and MARKS.match(text[end]):  # keep the last letter's vowels
        end += 1
    return text[start:end].replace("\u200f", "").replace("\u200e", "").strip()


def cut_text(text: str, marker: dict, where: str) -> str:
    frm, to = marker["from"], marker.get("to", marker["from"])
    if frm not in text or (text.count(frm) != 1 and not marker.get("first")):
        raise SystemExit(f"{where}: 'from' found {text.count(frm)} times: {frm}\n  text: {text}")
    s = text.index(frm)
    e = text.find(to, s)
    if e < 0:
        raise SystemExit(f"{where}: 'to' not found after 'from': {to}\n  text: {text[s:]}")
    return text[s : e + len(to)].strip()


def cut(fn, text, marker, where):
    """A marker, or a list of markers when narration interrupts the wording; parts are joined with an ellipsis."""
    if isinstance(marker, list):
        return " … ".join(fn(text, m, where) for m in marker)
    return fn(text, marker, where)
