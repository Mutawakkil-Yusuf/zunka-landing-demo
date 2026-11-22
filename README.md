# Zunka — landing page

> **A concept build, not a live product.** This is a visual study made from a design reference. The
> brand, copy, links and form endpoint are placeholders. The page works; it just isn't meant to ship
> as-is.

Zunka is a Figma plugin for mobile app teams: design screens from your own components, then export a
whole flow in one click. This site is a static, responsive study of that idea, built from the supplied
reference. Its layout, palette and graphic devices are reproduced in original code, with a coined
brand name and original copy. Nothing — code, copy or imagery — was taken from the reference site.

## Run it locally

```bash
cd /root/zunka-landing
npm run dev          # http://localhost:5173
```

There is no build step. `index.html` also works from any static server.

## Project layout

| File | What it holds |
|---|---|
| `index.html` | Markup, metadata, SVG symbol sprite, mascot and all sections |
| `styles.css` | Reference hero, SVG glyphs, band, mocks, shadows and responsive rules |
| `motion-custom.css` | Micro-interactions, mock loops, mascot and CSS 3D |
| `motion-custom.js` | GSAP timeline for the hero's supporting cast |
| `eye-motion.js` | Shared eye engine: tracking, scan, blinking, mascot and CSS 3D tilt |
| `text-motion.js` | Headline scramble, word wave, lead rise, band wave and heading settle |
| `mockup-motion.js` | Pausable loops for the product window and four feature mocks |
| `playground.js` | Select, drag-to-reorder, component sync and export interactions |
| `typewriter.js` | Rotating last word of the headline; emits `zk:typing` progress events |
| `assets/hero-3d-still.svg` | The still behind the CSS 3D hero card |
| `assets/` | The design-taste-frontend kit (system, layout, motion, backgrounds, moments) |
| `favicon.svg`, `og-card.png`, `og-card.html` | Tab icon, 1200×630 OG card and its source |
| `copy.md`, `names.json` | Copy plan and brand-name search |
| `responsive-check.mjs` | Playwright sweep across 14 viewports |
| `animation-check.mjs` | Playwright check of the reveal, eye scan, caret tracking, mascot and reduced motion |

Custom scripts and styles carry cache-busting query strings, so a normal refresh always loads the
current eye engine rather than a stale copy.

## Design decisions

Each choice below is deliberate. Where the reference and the design kit disagreed, the reference won.

- **Scope.** One product, stated plainly: a Figma plugin for mobile app teams. The page is
  software-first (`site-kind: software`) and every section serves that single story.
- **Palette.** Taken from the reference: `#F2F2F2` page, `#FFFFFF` header, `#E7E51E` accent,
  `#0A0A0A` ink, `#6FD623` doodle green. Applied through `start.mjs brand`.
- **Type.** Funnel Display for the headline, Funnel Sans for body copy, DM Mono for small labels.
- **Hero.** The reference supplies its own composition, so we kept it instead of the layout kit's
  default triptych. The kit animates the headline's line masks; GSAP handles the logo, plane, band
  and tiles.
- **Entrance.** No loading curtain. The page opens straight into a staged reveal over roughly 2.6s:
  headline lines 180ms apart at 900ms each, then the lead, buttons, plane and band with room to breathe.
- **Animated text.** Only the last word rotates — `teams → designers → developers → founders →
  creators → builders → studios` — typed at 90ms per letter, held for 4.2s, erased at 60ms, then a
  900ms pause before the next word. The caret blinks throughout; everything else stays still so the
  movement has somewhere to land.
- **Eyes.** The logo, headline and mascot share one rAF loop. The headline eye also scans left and
  right about every two seconds, with pointer movement briefly taking over. While the last word
  types, its pupils follow the caret left to right, rest at the end of the word, then track the
  erase; the idle scan resumes in the gap between words. `typewriter.js` emits `zk:typing` events
  with a progress value and the eye engine listens, so neither script needs to know about the other.
- **Mascot.** A bottom-right companion with two eyes. Tap it for a dry observational line delivered
  as a typewriter, with a small bounce and no expression changes. It also notices what you do in the
  playground — a reordered flow or a synced component earns one dry remark. It dims over the footer
  and stays out of the way of the copy.
- **3D.** A CSS 3D perspective card holds a three-phone still that tilts with the pointer and spins
  briefly on press. No WebGL context, so it remains reliable on mobile.
- **Living mocks.** The product window and four feature panels run slow, transform-only loops while
  on screen and rest when they scroll away. The pause controls are removed for now.
- **A playable mock.** The page behaves like the plugin it sells. Click a layer to inspect its frame;
  drag the layers, or use the arrow keys, to reorder the flow — the canvas, the flow card and the
  export list all follow. Pick a component variant and every screen changes with it. Export produces
  a real SVG contact sheet of your chosen order. Everything works with a keyboard, and reduced motion
  skips the animation without skipping the result.
- **Desktop layout.** The feature grid is a compact 2×2 on one screen, and the steps section renders
  its content at all times rather than hiding it behind a scroll. OG metadata points to `og-card.png`.
- **Sign up.** Stays a pill at every width. We override the kit's phone-sized underline treatment.
- **Links.** Every CTA is a placeholder anchor into a real section of the page. The form uses a
  `hello@zunka.example` mailto stand-in until a real endpoint is supplied.

## Checks

- `copy-lint.mjs` — 0 failures, 0 warnings.
- `layout/check.mjs` — no findings at 1440, 1024, 820, 768 and 390 px.
- `node responsive-check.mjs` — 14 viewports from 2560×1440 down to 320×640. No horizontal overflow
  and no console errors.
- `node animation-check.mjs` — the hero reveal, idle eye scan, caret tracking, mascot tap, band
  button visibility and reduced-motion states are all verified. No console errors.
- Playground check — select, pointer drag, keyboard reorder, component sync, export download and
  reset all verified, including under reduced motion. The downloaded SVG carries the chosen order.
- `consistency.mjs` — 16 FAIL and 21 WARN, the same reference conflicts as the committed baseline
  (which had 16 FAIL and 22 WARN); two checks improved, none regressed.
- `gate.mjs` — 17 FAIL, down from the baseline's 18. The findings are the deliberate differences
  between the supplied reference and the kit's generic rules: three hero actions, wide mock panels
  that read as bands, two headings sharing a screen near the footer, band text that starts on an
  internal line, and a companion that sits outside the main flow. We kept the reference's look.

## Before this goes live

1. Point the three CTAs at real destinations.
2. Replace the `.example` mailto stand-in with a working form endpoint.
3. Swap the inline SVG mark for final logo files, if you have them.
4. Set a canonical domain for `<link rel="canonical">` and the OG image URL.
5. Add Privacy and Terms pages if the legal row needs them.
