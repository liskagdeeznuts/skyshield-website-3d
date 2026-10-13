# ProjectMapIt — Integration Guide ("See Our Work Near You")

## What this is
ProjectMapIt (PMI) hosts your interactive project map as a standalone page:
`https://projectmapit.com/skyshield-roofing-of-new-england/map?map=6878226ca5e22d2746be811c`

You integrate it by **embedding that URL in an `<iframe>`**. It's a live feed — as PMI adds new
installs, the map on your site updates automatically. You don't copy or maintain any data.

A ready-to-paste, brand-styled, responsive component is in **`projectmapit_embed.html`** (this folder).

## Where it goes
On the **Home page**, as the "See the SkyShield Difference Near You" / trust section (this replaces
the Project-map slot from the build playbook). It also works well near the top of the **Insurance**
or **Residential** content as social proof. Use it once as the primary map; link out elsewhere.

## How to wire it in (hand this to Claude Code)
> Add a "See Our Work Near You" section to the Home page using the markup in
> `projectmapit_embed.html`. Keep it as a responsive iframe of the live ProjectMapIt map. Match it to
> our design system (use our real .btn classes if they exist; otherwise keep the fallback styles).
> Make the iframe `loading="lazy"` and give it a descriptive `title`. Put real, crawlable heading +
> intro text around it naming our service-area towns — the iframe contents are NOT indexable, so the
> surrounding copy carries the local SEO. Verify it renders on localhost before moving on.

## Important checks
1. **Framing permission (do this first).** Some hosted apps block being iframed via
   `X-Frame-Options` / `Content-Security-Policy: frame-ancestors`. PMI is built to be embedded, so it
   should load — but confirm on localhost. If the frame shows blank or a "refused to connect" error,
   it's blocked: email PMI support (support@projectmapit.com) and ask for the official embed snippet
   / to whitelist your domain. Until then, use the **fallback** below.
2. **Responsiveness.** The component uses `aspect-ratio` (16:9 desktop, 4:5 on phones so pins stay
   tappable). Adjust `--pmi-aspect` to taste.
3. **Performance.** `loading="lazy"` keeps the heavy map off the critical path. Don't autoplay it
   above the fold on mobile.
4. **Privacy/consent.** PMI loads Google Tag Manager. If you add a cookie banner, gate the iframe
   behind consent (load `src` only after accept) to stay clean.

## Fallback (if iframing is ever blocked)
Replace the iframe with a clickable preview card that links out to the full map in a new tab:
- A static hero image (screenshot of the map) + heading + "Open our live project map →" button to
  the PMI URL. Lower fidelity, but zero framing risk and still great social proof.
- Capture the screenshot from your own browser at the map URL → save as
  `brand_assets/projectmapit-preview.jpg`.

## Bonus content already on your PMI page (real, usable elsewhere)
- **Recent installs** (good for the Shingles gallery / before-afters): 39 Jensen St, Manchester CT —
  TAMKO Titan XT Shadow Grey; 28 Country Side Ln, Scituate RI — TAMKO Titan XT Virginia Slate.
- **Short testimonials** (verbatim, from PMI/Google): Lisa Barile ("Excellent company… John Cook did
  a great job"), Donald Hill ("handled very well from the first meeting to post-installation review"),
  alex barney ("Spencer was great to work with and the roof came out great!"), adam ("…honest and
  credible… walked me through every step"), Loring Boyden ("Super impressive from start to finish").
- PMI reports **60+ client reviews** aggregated there.

## Heads-up: two domains in play
Your PMI page links to `skyshieldroofpro.com` (older domain) while your main marketing site is
`skyshieldroofing.com`. Decide which is canonical for the new build and keep links consistent.
