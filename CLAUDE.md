# CLAUDE.md — SkyShield Website

> This file has two parts. **Part 1** documents the project (what it is, stack,
> structure, how to run it). **Part 2** is the original frontend/build ruleset —
> preserved verbatim; follow it whenever writing or editing frontend code.

---

# Part 1 — Project Documentation

## What this is
Marketing website for **SkyShield** (roofing / roof-system company). A static,
multi-page site built by hand (no framework, no build step) whose signature
feature is a **scroll-driven "3D" roof animation**: a 120-frame pre-rendered
image sequence scrubbed on a `<canvas>` as the user scrolls, so the roof system
appears to assemble/explode. Supporting motion (smooth scroll, pinned sections,
parallax, count-ups, staggered reveals) is layered on with GSAP.

Canonical production URL: `https://www.skyshieldroofpro.com/`

## Tech stack & libraries
- **Plain HTML + CSS + vanilla JS** — no bundler, no framework, no build step.
- **Custom CSS** in `assets/css/styles.css` (~40KB). Note: this site does **not**
  use Tailwind, despite the default in Part 2 — styling is hand-written CSS.
- **GSAP 3.12.5 + ScrollTrigger** (CDN, cdnjs) — scroll animation engine.
- **Lenis 1.1.13** (CDN, unpkg) — smooth-scroll, synced to ScrollTrigger.
- **Fonts via Fontshare** — Clash Display (display/headings) + Satoshi (body).
- **Node tooling (dev only):** `puppeteer` (bundled Chromium, screenshots) and
  `ffmpeg-static` (used to generate the roof frame sequence from source video).

## Design direction & animation approach
- Dark, premium aesthetic; per-section background "color zones"; layered depth.
- **Smooth scroll** (Lenis) drives everything; GSAP `ScrollTrigger` registered on top.
- **Roof system** (`assets/js/home.js`): a pinned section where a `<canvas>`
  scrubs through `assets/roof-frames/frame_001.jpg … frame_120.jpg`
  (exploded → assembled) in sync with scroll, with floating labels / product
  markers and progress bars revealing in sequence.
- Hero parallax, pinned numbered "why-us" feature scroll, `data-count` count-ups.
- **Accessibility / capture fallback:** `lib.js` detects `prefers-reduced-motion`
  and headless capture (`navigator.webdriver` or `?capture`) and renders the
  **resting/final** layout statically (reveals shown, no pin, no Lenis) so
  screenshots compare the final state. Honor this when adding animations.
- `window.SkyShield` is the shared namespace exposed by `lib.js`
  (`{ lenis, gsap, ScrollTrigger, reduceMotion, countUp, revealAll }`).

## File structure
```
index.html              # Home (hero, roof-system canvas animation, why-us, stats)
insurance.html          # Insurance page
shingles.html           # Shingles / product page
assets/
  css/styles.css        # All site styles (hand-written)
  js/
    lib.js              # Shared behavior on every page (Lenis+GSAP, reveals, nav, count-up)
    home.js             # Home scroll mechanics (roof canvas scrub, parallax, why-us)
    shingles.js         # Shingles page behavior
    compare.js          # Comparison widget
    main.js             # Misc/shared
  img/                  # Optimized site images (avif/png/svg, logos, badges)
  roof-frames/          # frame_001.jpg … frame_120.jpg — canvas animation sequence
serve.mjs               # Static dev server → http://localhost:3000
screenshot.mjs          # Puppeteer screenshot tool (see Part 2)
capture.mjs cap.mjs mshot.mjs   # Additional capture/helper scripts
*.md                    # Design references, brand guidelines, content, playbook
*.png *.avif *.mp4      # Source/reference art (large renders, source video)

247roofing/             # Separate client site (247 Roofing) — own subproject
hummingbird/            # Separate subproject
```
Note: `247roofing/` and `hummingbird/` are distinct sites living in this repo,
not part of the SkyShield site itself.

## Run locally
```bash
node serve.mjs            # serves project root at http://localhost:3000
PORT=4000 node serve.mjs  # custom port
```
No install needed to view the site (CDN libs, no build). For screenshot tooling:
`npm install` (pulls puppeteer + ffmpeg-static). Do not start a second server
instance if one is already running.

## Current status / what's unfinished
Observed state (verify against latest work — some of this is inferred from the code):
- **Live-ish pages:** `index.html`, `insurance.html`, `shingles.html`.
- The roof-system section header in `home.js` still describes a
  **"MECHANIC DEMO — placeholder layers"**; confirm whether the canvas frame
  scrub has fully replaced placeholder layers and whether product markers/labels
  are final.
- Hosting/deploy not yet set up here — discussed moving hosting to a static host
  (e.g. Netlify / Cloudflare Pages) and pointing the GoDaddy/Squarespace domain
  at it (Wix was the prior host and is a poor fit for a hand-coded site).
- `247roofing/` and `hummingbird/` are separate works-in-progress with their own
  status (see project memory / their own files).

_Update this section as the project progresses._

---

# Part 2 — Frontend / Build Rules (original, authoritative for all frontend code)

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed locally in `node_modules/` (bundled Chromium). Install, if ever needed again, with `npm install puppeteer --cache ./.npm-cache`.
- **Always screenshot from localhost:** `node screenshot.mjs <url> <name> [--section]`
  - `<name>` is the output filename (no extension). Use a clear, sortable convention so passes and sections are easy to tell apart: `home_pass1_hero`, `home_pass1_section2`, `home_pass2_hero`, etc.
  - `--section` captures only the viewport (above the fold). Default is a full-page capture of the whole scrollable page.
  - Example: `node screenshot.mjs http://localhost:3000 home_pass1_hero --section`
- Screenshots are saved to `./temporary_screenshots/<name>.png`. Existing files are never overwritten — a duplicate name gets a `-2`, `-3`, … suffix.
- Capture is 1440×900 viewport at 2× device scale (crisp retina output).
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary_screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## Build Protocol

Follow this protocol whenever we start building something.

**Before writing any code:**

**Find the real goal.** Interview me with focused questions to uncover what
this project actually needs to accomplish. Don't assume intent — ask until
the true objective is clear.

**Bias toward small, compartmentalized specs.** Break the work into the
smallest independent pieces possible. Prefer many narrow, self-contained
specs over a few large ones.

**Make me verify key decisions explicitly.** Surface every important
decision (scope, architecture, tradeoffs) and have me confirm it before you
proceed. Nothing important gets decided silently or missed.

**Define "great" before starting.** State the precise, specific evaluation
criteria for a high-quality result. If a past example exists, use it as the
format and quality bar to match.

**Before delivering:**

**Self-check against the criteria.** Evaluate the output against the criteria
from step 4 and report exactly where it meets or falls short of each.

**Get a second set of eyes.** Recommend (or run) a second-AI review of the
final output to catch anything I or you missed.
