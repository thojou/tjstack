#!/usr/bin/env python3
"""Deterministic Markdown -> PDF converter with a neutral base style and optional themes.

Usage:
  python3 md_to_pdf.py INPUT.md [-o OUTPUT.pdf] [--theme THEME.css ...] [--lang LANG]
                       [--title TITLE] [--keep-html]

A theme is a CSS file layered on top of assets/print.css. Relative url(...) references
in a theme (fonts, images) resolve against the theme file's directory. Without --theme,
the MD_TO_PDF_THEME environment variable is used when set (os.pathsep-separated list).

Requires: markdown, beautifulsoup4, and google-chrome or chromium.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import markdown
    from bs4 import BeautifulSoup
except ImportError as exc:
    sys.stderr.write(
        "Missing dependency: pip install markdown beautifulsoup4\n"
        f"({exc})\n"
    )
    sys.exit(2)

SKILL_ROOT = Path(__file__).resolve().parent.parent
BASE_CSS = SKILL_ROOT / "assets" / "print.css"

TOC_TITLES = {"inhalt", "inhaltsverzeichnis", "contents", "table of contents", "toc"}
CSS_URL = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""")


def die(msg: str, code: int = 1) -> None:
    sys.stderr.write(msg.rstrip() + "\n")
    sys.exit(code)


def find_chrome() -> str:
    override = os.environ.get("MD_TO_PDF_CHROME")
    if override:
        return override
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        path = shutil.which(name)
        if path:
            return path
    die("No Chrome/Chromium found (install one, or set MD_TO_PDF_CHROME to its binary)")


def absolutize_urls(css: str, base_dir: Path) -> str:
    """Rewrite relative url(...) references so they resolve from the temp HTML file."""

    def repl(match: re.Match) -> str:
        quote, ref = match.groups()
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|/)", ref, re.IGNORECASE):
            return match.group(0)
        return f'url("{(base_dir / ref).resolve().as_uri()}")'

    return CSS_URL.sub(repl, css)


def load_css(themes: list[Path]) -> str:
    if not BASE_CSS.is_file():
        die(f"Missing stylesheet: {BASE_CSS}")
    parts = [BASE_CSS.read_text(encoding="utf-8")]
    for theme in themes:
        if not theme.is_file():
            die(f"Theme not found: {theme}")
        parts.append(absolutize_urls(theme.read_text(encoding="utf-8"), theme.parent))
    return "\n\n".join(parts)


def preprocess_markdown(text: str) -> str:
    text = text.replace("- [ ] ", "- ☐ ")
    text = text.replace("- [x] ", "- ☑ ")
    text = text.replace("- [X] ", "- ☑ ")
    return text


def md_to_body_html(md_text: str) -> str:
    return markdown.markdown(
        preprocess_markdown(md_text),
        extensions=["tables", "fenced_code", "sane_lists", "smarty"],
        output_format="html5",
    )


def heading_level(tag) -> int:
    return int(tag.name[1])


def attach_heading_anchors(soup: BeautifulSoup) -> None:
    """Move empty `<a id>` markers onto the following heading so PDF links land on the chapter."""
    for anchor in list(soup.find_all("a")):
        if anchor.get("href") or not anchor.get("id") or anchor.get_text(strip=True):
            continue
        heading = anchor.find_next(["h1", "h2", "h3", "h4"])
        if heading is not None and not heading.get("id"):
            heading["id"] = anchor["id"]
        parent = anchor.parent
        anchor.decompose()
        if (
            parent is not None
            and getattr(parent, "name", None) == "p"
            and not parent.get_text(strip=True)
            and parent.find("a") is None
        ):
            parent.decompose()


def structure_body(soup: BeautifulSoup) -> None:
    """Wrap headings with following content for pagination safety."""
    for h in list(soup.find_all(["h1", "h2", "h3", "h4"])):
        level = heading_level(h)
        siblings_to_wrap: list = []
        for sib in list(h.next_siblings):
            if getattr(sib, "name", None) is None:
                if str(sib).strip() == "":
                    continue
                break
            if sib.name and sib.name[0] == "h" and sib.name[1:].isdigit():
                break
            siblings_to_wrap.append(sib)
            if level <= 2:
                if sib.name == "p":
                    for nxt in list(sib.next_siblings):
                        if getattr(nxt, "name", None) is None:
                            if str(nxt).strip() == "":
                                continue
                            break
                        if nxt.name in ("table", "pre", "ul", "ol"):
                            siblings_to_wrap.append(nxt)
                        break
                break

        if not siblings_to_wrap and level > 2:
            continue

        wrapper = soup.new_tag("div")
        title = re.sub(r"\s+", " ", h.get_text(" ", strip=True))
        if title.lower() in TOC_TITLES:
            wrapper["class"] = "toc"
        elif level >= 3:
            wrapper["class"] = "subsection keep-together"
        elif level == 2:
            wrapper["class"] = "heading-block chapter"
        else:
            wrapper["class"] = "heading-block"

        h.insert_before(wrapper)
        wrapper.append(h.extract())
        for sib in siblings_to_wrap:
            wrapper.append(sib.extract())

    for tag in soup.find_all(["table", "pre"]):
        classes = list(tag.get("class", []) or [])
        if "keep-together" not in classes:
            classes.append("keep-together")
            tag["class"] = classes

    for ul in soup.find_all("ul"):
        text = ul.get_text()
        if "☐" in text or "☑" in text:
            classes = list(ul.get("class", []) or [])
            if "checklist" not in classes:
                classes.append("checklist")
            ul["class"] = classes


def extract_title(soup: BeautifulSoup, fallback: str) -> str:
    h1 = soup.find("h1")
    if h1:
        return re.sub(r"\s+", " ", h1.get_text(" ", strip=True))
    return fallback


def build_html(body_soup: BeautifulSoup, title: str, css: str, lang: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="{_escape(lang)}">
<head>
<meta charset="utf-8">
<title>{_escape(title)}</title>
<meta name="generator" content="md-to-pdf">
<style>
{css}
</style>
</head>
<body>
{str(body_soup)}
</body>
</html>
"""


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render_pdf(html_path: Path, pdf_path: Path) -> None:
    chrome = find_chrome()
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        chrome,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path.resolve()}",
        html_path.resolve().as_uri(),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0 or not pdf_path.is_file():
        die(
            "Chrome PDF render failed.\n"
            f"cmd: {' '.join(cmd)}\n"
            f"stdout: {result.stdout}\n"
            f"stderr: {result.stderr}"
        )


def convert(
    md_path: Path,
    pdf_path: Path,
    themes: list[Path],
    lang: str,
    keep_html: bool,
    title_override: str | None,
) -> Path:
    if not md_path.is_file():
        die(f"Markdown file not found: {md_path}")

    md_text = md_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(md_to_body_html(md_text), "html.parser")
    attach_heading_anchors(soup)
    structure_body(soup)
    title = title_override or extract_title(soup, md_path.stem)
    html_doc = build_html(soup, title, load_css(themes), lang)

    html_out = pdf_path.with_suffix(".html")
    with tempfile.TemporaryDirectory(prefix="md-to-pdf-") as tmp:
        target_html = html_out if keep_html else Path(tmp) / "document.html"
        target_html.write_text(html_doc, encoding="utf-8")
        render_pdf(target_html, pdf_path)

    return pdf_path


def default_themes() -> list[Path]:
    env = os.environ.get("MD_TO_PDF_THEME", "")
    return [Path(p).expanduser() for p in env.split(os.pathsep) if p]


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Convert Markdown to a print-ready PDF")
    p.add_argument("input", type=Path, help="Input .md file")
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output .pdf path (default: INPUT with .pdf)",
    )
    p.add_argument(
        "--theme",
        type=Path,
        action="append",
        default=None,
        help="Theme CSS layered over the base style; repeatable (default: $MD_TO_PDF_THEME)",
    )
    p.add_argument("--lang", default="en", help="Document language for hyphenation and quotes")
    p.add_argument("--keep-html", action="store_true", help="Also write sibling .html")
    p.add_argument("--title", default=None, help="Override document title")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    md_path = args.input.resolve()
    pdf_path = (args.output or md_path.with_suffix(".pdf")).resolve()
    themes = [t.expanduser().resolve() for t in (args.theme or default_themes())]
    out = convert(md_path, pdf_path, themes, args.lang, args.keep_html, args.title)
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
