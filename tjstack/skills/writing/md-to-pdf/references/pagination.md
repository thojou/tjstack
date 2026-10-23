# Pagination and layout contract

Owned by `assets/print.css` and `scripts/md_to_pdf.py`. A theme may restyle everything, but must not override these rules.

## Required behavior

1. **Every chapter starts a page.** Each Markdown `##` heading (`h2`) starts on a fresh page.
2. **No orphan headings.** A heading stays with the block that follows it (`break-after: avoid`, plus the `.heading-block` and `.subsection` wrappers).
3. **No split tables or diagrams.** `table` and `pre` get `keep-together` and `break-inside: avoid`.
4. **Room around chapters.** Extra space before and after `h2` and `h3` subsections.
5. **Checklists.** `- [ ]` and `- [x]` render as ☐ and ☑ inside a `.checklist` block that avoids internal breaks where it can.

## DOM produced by the script

- `h1` → `.heading-block` (title plus the first meta paragraph)
- `h2` → `.heading-block.chapter` (plus the first paragraph and an optional following table, `pre`, or list)
- `h3`/`h4` → `.subsection.keep-together`, wrapping the subsection up to the next heading
- A heading titled `Contents`, `Table of Contents`, `TOC`, `Inhalt`, or `Inhaltsverzeichnis` → `.toc` (no keep-together, so a long table of contents may continue on the next page)
- Empty `<a id>` markers move onto the following heading, so in-document links land on that chapter.

## Verification checklist

- [ ] Each top-level chapter begins at the top of a page
- [ ] No table split across pages
- [ ] Code and ASCII diagrams (`pre`) intact on one page
- [ ] No heading alone at the bottom of a page
- [ ] Fonts are the ones the theme names, not fallbacks (`pdffonts OUTPUT.pdf`)
