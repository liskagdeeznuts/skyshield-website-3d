# SkyShield Website — Build Playbook (v2: three-page site)

A field guide for building a premium, scroll-driven contractor site in Claude Code.
**Hour-one goal:** Home page fully built + polished, with the Shingles and Insurance
pages stubbed (real nav + skeleton + placeholders) so the site is navigable and showable.
Then build the two inner pages and the animations in later phases.

---

## The crew (who does what)

- **Claude Code** (VS Code extension) — the builder. All site code happens here.
- **Cowork** — the researcher. Gathers logos, product images, Google reviews, the thank-you
  card photo, spec language, and the CT statute text; scrapes your current site for copy.
  Runs *in parallel* during Phase 1.
- **Higgsfield** (connected) — media generator for the Phase 2 cinematic roof reveal and the
  Phase 3 wind-damage 3D animation.

---

## Site architecture (three pages)

### 1. Home (Autarq-style showcase)
- **Hero** — layered exploded parallax: roof stack pulls apart, floating labels (Titan XT
  shingle, underlayment, decking, Lomanco ridge vent). *Built in hour one.*
- **The SkyShield Roof System** — cinematic "house opens up" scroll reveal. *Phase 2, video-to-website.*
- **Trust bar** — manufacturer + certification logos (TAMKO, Lomanco, underlayment brand).
- **Testimonials** — real Google reviews (best ones, with star rating + reviewer name).
- **Thank-you card** — the homeowner's handwritten card photo from your salesman, its own
  warm human-touch section.
- **Final CTA** — sticky "Get a Free Inspection."
- **Footer** — contact, license #, certifications, socials.

### 2. Shingles / "See Your New Roof" (separate page)
- **Drag-to-compare slider** — old/worn roof vs new SkyShield roof.
- **Color options** — the shingle colors/lines you install (Autarq "explore the options" pattern).
- **Why we chose TAMKO** — short story block: the contractor relationship (why they won us
  over vs competing brands) + the quality of the Titan XT shingle. Pull supporting specs/imagery
  from TAMKO's site (Cowork). This is the page's trust spine.
- Light CTA to inspection.

### 3. Insurance Restoration (separate tab — its own scroll-down journey)
Order, top to bottom:
1. **How wind damage actually happens** — primes the homeowner; the 3D wind-damage
   animation eventually lives here (Phase 3). Until then, a static explainer + diagram.
2. **The Connecticut matching law** — CT Gen. Stat. § 38a-316e. If replacement shingles
   can't match adjacent ones in quality/color/size, the insurer must replace to a
   "reasonably uniform appearance." Hook: a few damaged shingles can mean a far larger
   claim. (Copy tone: "you may be entitled — let's find out." NOT a guaranteed-payout
   promise; outcomes are fact-specific.)
3. **Our process** — collapsed into **5 public phases** (not the 13 internal stages), shown
   beside a **phone mockup of your live progress dashboard** so homeowners see they'll be able
   to track exactly where their job is. The 5 phases:
   1. **Free Inspection** — we assess and document the damage.
   2. **Claim & Approval** — we work with your adjuster (matching-law leverage applies here).
   3. **Colors & Scheduling** — pick your shingle, lock the build date.
   4. **Installation** — our crew installs your new roof.
   5. **Completed & Warranty** — final walkthrough, you're covered.
   *Phone visual:* MVP = a clean tilted-phone mockup of the dashboard with the 5 phases listed.
   *Phase 2.5 upgrade* = the sideways phone with screens receding in 3D layers, each layer a
   phase revealed on scroll (CSS 3D / GSAP — no video). Cowork grabs a dashboard screenshot.
4. **CTA** — Free roof inspection to see if it can be covered.

---

## Reference mapping: Autarq → SkyShield (for the Home page)

| Autarq pattern | SkyShield version |
|---|---|
| Floating exploded hero | **Roof stack** pulling apart with floating labels |
| "The Autarq system" key-visual | **Cinematic Roof System reveal** (Phase 2) |
| Footer awards/certs | **Manufacturer certs, license #, reviews** |
| "Colours / explore the options" | Moves to the **Shingles page** color picker |
| "Aesthetic" before/after drag | Moves to the **Shingles page** slider |

What Autarq lacks (your differentiators, on their own pages): **Insurance Restoration**,
the **process journey**, and the **free-inspection funnel**.

---

## PHASE 1 — Home page baseline + stubbed inner pages (~60 min)

### Min 0–5 — CLAUDE.md + brand_assets + kick off Cowork
- Create `brand_assets/` (logo + `brand_guidelines.md`: colors, fonts, voice).
- Create `CLAUDE.md` from the starter below.
- Start the Cowork tasks (bottom of this doc) in parallel.

### Min 5–10 — Capture the reference (PDF Hack #3)
On autarq.com/en-de/solar-roof-tile/: `F12` -> `Ctrl+Shift+P` -> "Capture full-size
screenshot"; then DevTools -> Elements -> Styles -> copy.

### Min 10–30 — Clone the Home structure with the screenshot loop
Paste **Prompt A** (drag in screenshot, paste style). Two self-correction passes.
> If it keeps asking permission: Settings -> "Claude Code" -> Allow Dangerously Skip
> Permissions (only while you're monitoring).

### Min 30–35 — Real content + brand
Paste **Prompt B** once Cowork has staged `content.md`, logos, reviews, and the card photo.

### Min 35–50 — Section skeleton + nav + stub the inner pages + CTA funnel
Paste **Prompt C**. Builds the Home sections, the parallax hero, the sticky CTA, AND
creates the two inner pages as navigable stubs.

### Min 50–60 — Review on localhost (+ optional deploy)
Review at localhost; give plain verbal feedback. Optional: push to GitHub -> import to
Vercel -> deploy (only when happy; CLAUDE.md blocks pushes until you say so).

**End of hour:** polished, navigable, branded SkyShield site you can show.

---

## PHASE 2 — Cinematic Roof System reveal (Home page)

The "house opens up, each layer explained as you scroll."
1. **Source video**: generate the layered roof-assembly clip in **Higgsfield**, screen-record
   a 3D model, or use a licensed manufacturer animation.
2. **Install ffmpeg** locally (the video-to-website skill needs it; repoint its hardcoded
   path to your own ffmpeg).
3. In Claude Code: *"Use the video-to-website skill on `<video path>`. Theme SkyShield.
   Caption order: decking -> underlayment -> Titan XT shingles -> ridge vent -> flashing.
   Brand colors. Standalone piece to drop into the Roof System section."*
4. Drop it into the reserved ROOF_SYSTEM_SLOT.
> For animated pieces, tell Claude Code: *"This is animated — do NOT use the screenshot tool
> to compare; just work in the code and I'll review."*

---

## PHASE 3 — Wind-damage 3D animation (Insurance page)

Ground view -> gust -> push into a shingle -> tab flips up -> settles with a subtle crease ->
pull back -> damage invisible from the ground -> CTA.
1. Generate the clip in **Higgsfield** (or storyboard a frame sequence).
2. Build it as a standalone animated piece dropped into WIND_DAMAGE_SLOT on the Insurance page.
3. The rest of the Insurance page (CT law, process stages, CTA) ships before this — the
   animation upgrades the top of that page when ready.

---

## Starter CLAUDE.md (paste into project root, then refine)

```markdown
# SkyShield Roofing — Website Project

## Goal
A premium, scroll-driven contractor site (3 pages: Home, Shingles, Insurance Restoration).
Modern, branded, high-trust — NOT generic or "AI vibe-coded."
Reference quality target: autarq.com/en-de/solar-roof-tile/ (clone STRUCTURE + INTERACTIONS,
not their solar content — we're a roofing contractor).

## Rules (every session)
- ALWAYS invoke the front-end design skill before writing any front-end code. No exceptions.
- Reference /brand_assets for logo, colors, fonts, brand voice on anything visual.
- Use real content from /content.md. Never invent specs, stats, reviews, or legal claims —
  leave a clearly marked [PLACEHOLDER] and tell me.
- Insurance page legal copy: educate and motivate an inspection. Do NOT promise guaranteed
  payouts; matching outcomes are fact-specific.
- Test on localhost first. Do NOT commit or push to GitHub until I explicitly say so.
- Reserve clearly-commented empty slots for later imports:
  HERO is a parallax (build now); ROOF_SYSTEM_SLOT and WIND_DAMAGE_SLOT stay empty for animations.

## SEO (apply on every page)
- Semantic HTML5, exactly one <h1> per page, descriptive <h2>/<h3> hierarchy.
- Unique <title> + meta description per page. Descriptive alt text on every image.
- Work in local keywords naturally: our CT service-area towns, "roof replacement,"
  "storm/wind damage roof," "insurance restoration roofing." Don't keyword-stuff.
- Add schema.org LocalBusiness (RoofingContractor) JSON-LD with name, area served, phone.
- Preserve the important content/keywords from /content.md (carried over from the old site).
- Full SEO/redirect migration is a later pass — just don't ship anything SEO-hostile.

## Brand
- Company: SkyShield Roofing
- Colors: [hex codes]
- Fonts: [display] / [body]
- Voice: trustworthy, premium, plain-spoken, homeowner-facing.

## Screenshot workflow
- Puppeteer screenshots its own output, self-corrects (2 passes), saves to
  /temporary_screenshots (clean periodically). Skip the loop for animated sections.

## Deploy
- local -> GitHub -> Vercel (auto-deploy on push). Push only on my say-so.
- Never commit secrets.
```

---

## Copy-paste prompts for Claude Code

**Prompt A — Clone the Home structure (Min 10)**
```
Spin up a new website cloning the STRUCTURE and INTERACTION PATTERNS of this reference:
autarq.com/en-de/solar-roof-tile/. Screenshot [drag in] + style code [paste]. Invoke the
front-end design skill first.

Clone these patterns for the HOME page:
- The exploded/floating cross-section hero with floating component labels (build this as a
  scroll-driven layered PARALLAX — separate PNG layers, no video).
- The clean section rhythm: big detail photos, oversized headings, generous whitespace.

Do NOT copy their solar content or German text — this is SkyShield, a roofing contractor.
Use [PLACEHOLDER] copy; I'll swap real content next. Build it, start a local server,
screenshot your output, compare to the reference, two rounds of fixes. Premium and clean.
```

**Prompt B — Brand + real content (Min 30)**
```
This layout looks good. Work in our brand assets from /brand_assets (logo, colors, fonts,
voice) and replace placeholder text with real copy from /content.md. Add the testimonials
section using the real Google reviews in /content.md (stars + reviewer name), and add a
"thank-you card" section featuring the homeowner card photo in /brand_assets. SkyShield Roofing.
Keep the layout quality; make it ours.
```

**Prompt C — Sections, nav, stub inner pages, CTA (Min 35)**
```
Finalize the HOME page sections in order: Hero (parallax roof stack), The SkyShield Roof
System (leave a commented empty ROOF_SYSTEM_SLOT), Trust bar (manufacturer logos),
Testimonials (Google reviews), Thank-you card, Final CTA, Footer.

Build top nav with three pages: Home, Shingles, Insurance Restoration.

Create two STUB pages (real files, nav links work, skeleton + [PLACEHOLDER] content):
- shingles.html: a drag-to-compare before/after slider (build it working), a color-options
  row, and a "Why we chose TAMKO" story block.
- insurance.html: a scroll-down page in this order — How Wind Damage Happens (commented empty
  WIND_DAMAGE_SLOT at top), The Connecticut Matching Law (§ 38a-316e), Our Process (a tilted
  phone mockup of the dashboard with 5 labeled phases beside it: Free Inspection, Claim &
  Approval, Colors & Scheduling, Installation, Completed & Warranty), Free Inspection CTA.

Apply the SEO rules from CLAUDE.md to all three pages (titles, meta, h1, alt text, schema).

Add a sticky "Get a Free Inspection" CTA persisting on scroll across all pages, and a contact
form under each Final CTA. Keep everything on-brand.
```

---

## Cowork tasks (start at Min 0, in parallel)

1. **Scrape + preserve** SkyShield's current site -> `content.md`: services, copy, service-area
   towns, contact, license #, FAQs, AND the SEO-important keywords/phrases already ranking — we
   don't want to lose that equity.
2. **Google reviews**: pull the best real reviews verbatim (text, star rating, reviewer first
   name) into `content.md`.
3. **Thank-you card**: get the salesman's homeowner-card photo into `brand_assets/` (crop/blur
   any full name or address before it goes public).
4. **Logos + product imagery + specs**: TAMKO Titan XT, Lomanco ridge vent, underlayment
   brand, installer certifications.
5. **TAMKO story**: gather the "why we chose TAMKO" supporting material — Titan XT specs +
   what makes TAMKO strong for contractors — for the Shingles page block.
6. **CT statute**: exact text of Conn. Gen. Stat. § 38a-316e + a plain-English summary into
   `content.md` (Insurance page).
7. **Process phases + dashboard shot**: confirm the 5 public phases and capture a clean
   screenshot of the live progress dashboard for the phone mockup -> `brand_assets/`.
8. **brand_assets/**: logo + `brand_guidelines.md` (hex colors, fonts, voice).
9. **(Phase 2 prep)** the roof-layer order with one above-and-beyond line each (caption script).
