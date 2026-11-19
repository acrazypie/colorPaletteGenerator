# Palette — colour palette generator

A fast, private colour palette generator. Pick a base colour and a harmony, lock what you like, shuffle the rest, then export straight to code. No sign-up, no tracking, no build step: everything runs and stays in your browser.

Italian version: [README_IT.md](README_IT.md)

## Features

-   **Nine harmonies**: analogous, monochromatic, complementary, split complementary, triadic, tetradic, square, shades & tints, and "surprise me". The base colour always appears in the palette.
-   **Lock and shuffle**: lock any colour and press <kbd>space</kbd> (or Generate) for new ones that still match the locked colours.
-   **Edit any swatch** with the colour picker, **drag to reorder**, add or remove colours (2–10).
-   **Shades**: an 11-step tint/shade ramp (50–950) for every colour, with RGB, HSL and contrast details.
-   **Contrast badges**: every swatch shows its WCAG grade (AAA / AA / AA Large) for the most readable text colour.
-   **Colour names** for every swatch.
-   **Colour-blind preview**: protanopia, deuteranopia, tritanopia and greyscale simulation.
-   **Palette from an image**: drop a photo and its main colours are extracted locally (k-means in Lab space); nothing is uploaded.
-   **Export** to CSS variables, SCSS, Tailwind config, JSON, a plain array or SVG, and download a PNG image.
-   **Copy as** HEX, RGB or HSL.
-   **Undo / redo** history.
-   **Save palettes** on your device, and **share** them: the URL always contains the current palette.
-   Light and dark theme, six languages (EN, IT, FR, DE, ES, JA), keyboard shortcuts, responsive from small phones to wide screens.

## Keyboard shortcuts

| Key                    | Action                              |
| ---------------------- | ----------------------------------- |
| <kbd>Space</kbd>       | New palette (locked colours stay)   |
| <kbd>1</kbd>–<kbd>9</kbd> | Lock or unlock that colour       |
| <kbd>C</kbd>           | Copy every colour                   |
| <kbd>S</kbd>           | Save the palette                    |
| <kbd>E</kbd>           | Open export                         |
| <kbd>Ctrl</kbd> <kbd>Z</kbd> / <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd> | Undo / redo |

## Running locally

It is a static site. Because it uses ES modules and loads the language files with `fetch`, serve it over HTTP rather than opening the file directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```
colorPaletteGenerator/
├── index.html          # markup, dialogs and colour-blind SVG filters
├── css/style.css       # design tokens (shared with egenesio.com), layout, components
├── js/
│   ├── app.js          # state, history, rendering and interactions
│   ├── palette.js      # harmony schemes, random colours, shade ramps
│   ├── colors.js       # conversions, WCAG contrast, colour names, image extraction
│   ├── names.js        # named colour list
│   ├── lang.js         # translations loader
│   └── theme.js        # light/dark toggle
├── lang/*.json         # EN, IT, FR, DE, ES, JA strings
├── fonts/              # Syne and DM Mono (SIL Open Font License)
└── icons/favicon.svg
```

## License

MIT, see [LICENSE](LICENSE). Fonts are under the SIL Open Font License (see `fonts/`).

## Author

Made by [Elisa](https://egenesio.com). If you find it useful, you can [buy me a coffee on Ko-fi](https://ko-fi.com/egenesio).
