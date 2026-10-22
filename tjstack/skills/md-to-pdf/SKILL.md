---
name: md-to-pdf
description: "Convert a Markdown file to a print-ready PDF with deterministic pagination: every chapter on a new page, no split tables or diagrams, no orphan headings. Neutral style by default, with an optional theme CSS for fonts and colors. Use for /md-to-pdf, 'Markdown to PDF', 'export this .md as PDF', or rendering a document with a theme."
disable-model-invocation: true
---

# md-to-pdf

Render Markdown to PDF through one script, a neutral base stylesheet, and headless Chrome. The look comes from a theme, never from ad-hoc HTML or CSS.

## Workflow

1. Resolve the input `.md` path. Ask only when none is given and none is obvious from the conversation.
2. Choose the output path: the same basename with `.pdf`, unless the user names one.
3. Pick the theme. Use the one the user names. Otherwise the script falls back to `$MD_TO_PDF_THEME`, then to the neutral base style. See [references/themes.md](references/themes.md).
4. Run the converter from this skill's directory. Do not reimplement the conversion inline.

   ```bash
   python3 <this skill's directory>/scripts/md_to_pdf.py INPUT.md -o OUTPUT.pdf [--theme THEME.css] [--lang de]
   ```

   Set `--lang` to the document's language. Add `--keep-html` only to debug layout.
5. Confirm the PDF exists. Check it against the list in [references/pagination.md](references/pagination.md) when layout matters, and run `pdffonts OUTPUT.pdf` when a theme sets fonts.
6. Report the absolute path of the PDF.

## Rules

- Always go through `scripts/md_to_pdf.py` and `assets/print.css`.
- Keep themes, brand fonts, and brand assets outside this repository. Pass them in with `--theme` or `MD_TO_PDF_THEME`.
- Never invent a theme's fonts or colors. Without a theme, the neutral base style is the output.
- Do not edit the pagination rules to fix one document. Fix the Markdown, or the theme.

## Dependencies

- `python3` with `markdown` and `beautifulsoup4` (`pip install markdown beautifulsoup4`)
- `google-chrome` or `chromium` on `PATH`, or `MD_TO_PDF_CHROME` set to the binary
