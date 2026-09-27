# Drawing App

A browser-based **freehand drawing app** — sketch on a canvas with multiple tools, colors, and brush sizes, then download your artwork as a PNG. Built as a fully client-side Next.js app; nothing ever leaves the browser.

## What it does

- **Freehand pen** — draw with a smooth pen, adjustable brush size
- **Eraser** — erase parts of the drawing
- **Shape tools** — rectangle, circle, and line tools
- **Text tool** — place text on the canvas
- **Color palette** — preset colors plus a custom color picker
- **Brush size slider** — control stroke width
- **Clear canvas** — wipe and start over
- **Download PNG** — export your drawing as an image file
- **Tooltips** — hover tooltips on every toolbar control

## Tech stack

| Layer        | Tech |
|--------------|------|
| Framework    | Next.js 15 (App Router, static export) |
| Language     | TypeScript |
| UI           | React 19, Tailwind CSS, shadcn/ui (Radix primitives) |
| Canvas       | HTML5 Canvas API |
| Icons        | Lucide React |

## Quick start

Prerequisites: Node.js 18+.

```bash
npm install          # or: pnpm install
npm run dev          # dev server at http://localhost:3000
```

Build a static export:

```bash
npm run build        # outputs to ./out
```

Serve the static build:

```bash
npx serve out        # or deploy ./out anywhere static
```

## Project structure

```
app/                # Next.js App Router (page, layout)
components/         # DrawingCanvas (toolbar + canvas logic), theme-provider
components/ui/      # shadcn/ui primitives (button, input, slider, tooltip)
lib/                # Shared utilities
styles/             # Global styles
public/             # Static assets
```

## Environment variables

None required — fully client-side, no backend or API keys.

## Deployment

The project is configured for static export (`output: "export"` in `next.config.mjs`). `npm run build` produces the `./out` directory, which can be hosted on GitHub Pages, Netlify, Cloudflare Pages, or any static host.

Live demo: https://girishlade111.github.io/drawing-app/

---

Built by Girish Lade — https://ladestack.in
