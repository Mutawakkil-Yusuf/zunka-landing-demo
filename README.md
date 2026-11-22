# Zunka landing page — demo only

> **This is a demo / concept project, not a production site.** It is a visual study built from a
> design reference. The brand, copy, links and form endpoint are placeholders. Do not use it as a
> real product or treat any content here as final.

A static, responsive landing page built from the supplied Pinterest reference. The reference's
layout, palette and graphic devices are reproduced with new code, a coined brand (`Zunka`) and
original copy. No code, copy or images were taken from the reference site.

## Run it

```bash
cd /root/zunka-landing
npm run dev          # http://localhost:5173
```

No build step. `index.html` can also be opened through any static server.

## Files

| File | What it holds |
|---|---|
| `index.html` | Markup, metadata, SVG symbol sprite, mascot, all sections |
| `styles.css` | Reference hero, SVG glyphs, band, mocks, shadows, responsive rules |
| `motion-custom.css` | Micro-interactions, mock loops, mascot, CSS 3D |
| `motion-custom.js` | GSAP timeline for the hero's supporting cast |
| `eye-motion.js` | Shared eye engine: tracking, scan, blinking, mascot, CSS 3D tilt |
| `text-motion.js` | Headline scramble, word wave, lead rise, band wave, heading settle |
| `mockup-motion.js` | Pausable loops for the product window and four feature mocks |
| `assets/hero-3d-still.svg` | The still behind the CSS 3D hero card |
| `assets/` | The design-taste-frontend kit (system, layout, motion, backgrounds, moments) |
| `favicon.svg`, `og-card.png`, `og-card.html` | Tab icon, 1200×630 OG card and its source |
| `copy.md`, `names.json` | Copy plan and brand-name search |
| `responsive-check.mjs` | Playwright sweep across 14 viewports |
| `animation-check.mjs` | Playwright check of hero reveal, eye scan, mascot tap, reduced motion |

All custom scripts and styles carry cache-busting query strings so a normal refresh cannot run a
stale eye engine.

## Design decisions

- **Kind:** software (a Figma plugin for mobile app teams), site-kind `software`.
- **Palette from the reference:** `#F2F2F2` page, `#FFFFFF` header, `#E7E51E` accent, `#0A0A0A`
  ink, `#6FD623` doodle green. Applied through `start.mjs brand`.
- **Type:** Funnel Display / Funnel Sans / DM Mono.
- **Hero:** the dealer returned `triptych`, but the brief supplies a different composition, so the
  reference structure was used. The kit animates the headline's line masks; GSAP handles the logo,
  plane, band and tiles.
- **Entrance:** no curtain. The page loads straight into the staged hero reveal. The lede, buttons,
  plane and band arrive in sequence over ~2.6s.
- **Animated text:** only the last word of the headline rotates — `teams → designers → developers →
  founders → creators → builders → studios` — typed at 90ms/letter, held 4.2s, erased at 60ms,
  with a 900ms pause before the next word. The caret blinks continuously. All other copy is static.
- **Sign up:** stays a pill at every width — the kit's phone-underlined secondary style is overridden.
- **Text pacing:** the hero reveal is a ~2.6s GSAP timeline started by the scatter — headline lines
  180ms apart at 900ms each, then lead, buttons, plane and band with generous gaps.
- **Eyes:** logo, headline and mascot share one rAF loop. The headline eye also scans left/right on
  its own about every two seconds; pointer movement temporarily overrides the scan.
- **Mascot:** bottom-right twin-eye companion. Tap for a dry observational line revealed as a
  typewriter, with a small bounce; no expression changes. Dims over the footer.
- **3D:** a CSS 3D perspective card holds a three-phone still that tilts with the pointer and spins
  briefly on press. No WebGL context, so it is reliable on mobile.
- **Living mocks:** the product window and four feature panels run slow transform-only loops while
  on screen, each with its own pause control.
- **Desktop layout:** the feature grid is a compact 2×2 on one screen, and the steps section renders
  its content at all times (no scroll-hidden moment). OG metadata points to `og-card.png`.
- **Links:** all CTAs are placeholder anchors into real page sections. The form uses a
  `hello@zunka.example` mailto stand-in until a real endpoint is supplied.

## Verification

- `copy-lint.mjs`: **0 FAIL, 0 WARN**.
- `layout/check.mjs`: **no findings** at 1920, 1440, 1024, 820, 768, 390 and 320.
- Playwright sweep (`node responsive-check.mjs`): **14 viewports from 2560×1440 down to 320×640**,
  zero horizontal overflow and zero console errors.
- Playwright animation check (`node animation-check.mjs`): hero reveal frames captured, autonomous
  scan confirmed, mascot tap phrase verified, band button opacity 1, reduced-motion states correct,
  zero console errors.
- `consistency.mjs` quick pass: accessibility, tap-size, focus, reduced-motion, gl-fallback and
  overflow checks pass. 11 findings remain; they are conflicts between the supplied reference and
  the skill's generic page rules (three hero actions, wide mock panels read as bands, two headings
  sharing a screen near the footer, text inside the band starting on internal lines). They were
  kept deliberately to preserve the reference's look.

## What to supply for production

1. Real destinations for the three CTAs.
2. A form endpoint to replace the `.example` mailto stand-in.
3. Final logo files if you want to swap the inline SVG symbol.
4. A canonical domain for `<link rel="canonical">` and the OG image URL.
5. Privacy and Terms pages if the legal row needs them.
