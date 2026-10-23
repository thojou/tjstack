# Themes

A theme is one CSS file layered after `assets/print.css`. Keep themes outside this repository, for example in `~/.config/md-to-pdf/<name>/theme.css`. Brand fonts, colors, and logos never get committed here.

## Select a theme

- Per run: `--theme ~/.config/md-to-pdf/acme/theme.css`. Repeat `--theme` to layer several files.
- As a default: `export MD_TO_PDF_THEME=~/.config/md-to-pdf/acme/theme.css`. Separate several files with `:` (`;` on Windows).
- `--theme` replaces the environment default for that run.

## Write a theme

Override the tokens the base style reads, then add whatever rules the design needs:

```css
@font-face {
  font-family: "Brand Sans";
  src: url("fonts/BrandSans-Regular.ttf") format("truetype");
  font-weight: 400;
  font-display: block;
}

:root {
  --font-body: "Brand Sans", sans-serif;
  --font-mono: "Brand Mono", monospace;
  --color-accent: #123456;
  --color-rule: #c8d0d8;
  --color-surface: #f4f6f8;
}

h1 { font-weight: 300; }
```

Relative `url(...)` paths resolve against the theme file's directory, so a theme folder can carry its own `fonts/`. Use `font-display: block` so Chrome waits for the font before printing.

## Tokens

| Token | Used for |
|---|---|
| `--font-body`, `--font-heading`, `--font-mono` | Body text, headings, code |
| `--color-text`, `--color-muted` | Body text, the meta line under the title |
| `--color-heading`, `--color-subheading` | `h1`/`h2`, `h3`/`h4` and TOC links |
| `--color-accent`, `--color-on-accent` | Table header, `pre` and blockquote bar |
| `--color-rule` | Heading underlines, table borders, link underline |
| `--color-surface`, `--color-surface-strong` | Zebra rows, `pre` and blockquote fill, inline code |
| `--radius` | Code and blockquote corners |

Leave the pagination rules in [pagination.md](pagination.md) alone.
