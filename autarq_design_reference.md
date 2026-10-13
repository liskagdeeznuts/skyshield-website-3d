# Autarq — Design Reference (for modeling the SkyShield site)

> Built from the live Autarq pages (June 11, 2026). I could not capture pixel screenshots — the
> browser tool is policy-blocked from autarq.com — so this documents each page's **section order,
> layout patterns, copy, and the real Autarq image URLs** so you (or Claude Code) can model the
> structure precisely. Image URLs are live; open any in a browser to view/save. Filenames in
> brackets match the screenshot naming convention you specified, in case you capture them later.

## Global patterns (apply to every page)
- **Top nav (sticky, minimal):** left logo; center/inline links — Solar Roof Tiles · Autarq System ·
  Invest in Autarq · Seeing is believing; a pill **Configurator** button (primary CTA, always visible);
  an "Autarq for → Homeowner / Roofer / Architect" audience switcher; language selector.
- **Section rhythm:** huge whitespace, oversized two-line headings in the pattern
  **"Word." (big) + "descriptive subhead" (lighter)** — e.g. *Aesthetic.* / *Get the look and the
  function.* Each section = one idea, one or two large edge-to-edge images.
- **Signature interaction:** before/after **image pairs** labeled "Regular roof tiles" vs "Solar roof
  tiles" (often a drag-compare or hover swap). Used on multiple pages.
- **Numbered vertical storytelling:** sections counted `01 / 02 / 03 / 04` down the page (sticky number
  while the content scrolls). This is the core scroll pattern to copy.
- **Recurring CTA band (every page, near footer):** "Configure your roof. Get in touch for an initial
  consultation and configuration." → **Explore** button.
- **Footer (tall, 3-column + trust):** Company / Explore / Autarq-for columns; social row (IG, LinkedIn,
  FB, YouTube); "Funded by EU" + member logos (BIPV, Swissolar, SolarPower Europe, DGNB, ESMC) +
  Awards strip (German Innovation, Red Dot, iF Design, German Design, Top100); legal row.
- **Aesthetic:** editorial, premium, lots of air, near-full-bleed photography, restrained type, almost
  no borders. This is the quality bar.

> SkyShield translation is in `reference_autarq/skyshield_mapping.md`.

---

## 1. Solar Roof Tiles — /solar-roof-tile/
*The flagship product page. This is the model for the SkyShield HOME page.*

Section order top→bottom:
1. **[01-hero]** Hero: "Autarq solar roof tiles" with floating/exploded component labels — **Solar
   module · Roof tile · Cable** — over a roof image. "See all products" link. *(This is the exploded
   cross-section hero the playbook wants to clone as a parallax.)*
2. **[02-aesthetic]** *Aesthetic.* / "Get the look and the function." — before/after pair:
   `11_2880x1620…webp` (Regular) vs `10_2880x1620…webp` (Solar). Copy on seamless integration + weight.
3. **[03-colours]** *Colours.* / "Explore the options." — color explorer with a zoomable tile image
   (`0000_Black_glazed_Day…webp`) and a small swatch row. → MODEL FOR SHINGLES COLOR PICKER.
4. **[04-durable]** *Durable.* / "25 years of performance, guaranteed." — detail photo
   (`13_2880_X3456…webp`) + 25-year warranty SVG badge (`25_years_warranty_regular…svg`).
5. **[05-impermeable]** *Impermeable.* / "Keep your roof as it should be." — numbered 01–04 animated
   sequence (waterproofing build-up).
6. **[06-quality]** *High quality.* / "Trust tried-and-tested materials." — detail photo
   (`15_2880x3456…webp`) + bullets (UV/weather resistant, non-toxic, recyclable).
7. **[07-comparison]** *Panels vs Tiles* / "Tiles win every time." — **4-row comparison table**
   (Aesthetics, Flexibility, Safety, Installation) with column thumbnails
   (`0000_16…webp` panels, `0001_17…webp` tiles). → STRONG PATTERN for "Why TAMKO / why us vs others."
8. **[08-system-teaser]** "The Autarq system" key-visual (`Key_Visual_Desktop_EN…png`) + "Explore" →
   system page. *(Equivalent to the SkyShield "Roof System reveal" slot.)*
9. **[09-tile-showcase]** "Solar roof tiles. Next level looks, one tile at a time." — product cards:
   Skarpnes Ovati™ (`18_…Skarpnes_Ovati_Black_Glaze…png`), Jacobi-Walther Stylist-PV
   (`Jacobi_0000_Black_Matte…webp`), CREATON PV-AUTARQ (`CREATON_0000_Black_Glaze…webp`).
10. **[10-audience]** Three big links: Autarq for Homeowners / Architects / Roofers.
11. **[11-cta]** "Configure your roof" CTA band.
12. **[footer]** Global footer.

---

## 2. Autarq System — /system-technology/
*Model for the SkyShield "Roof System / how it works" explainer.*

1. **[01-hero]** "The Autarq system." / "How it all comes together." + intro paragraph.
2. **[02-components]** "System components" — a stacked series of component cards, each = label
   ("System component" / "Optional" / "Other components") + H3 + gradient product image + paragraph:
   - Solar roof tiles `230117_Gradient_Roof_tiles…jpg`
   - Wire harness `…Wire_harness…jpg`
   - PV converter `…PV_converter…jpg`
   - Monitoring App `…Monitoring_App…jpg`
   - Standard solar inverter `…PV_inverter…jpg`
   - Wallbox `…Wallbox…jpg`
   - Battery Storage `…Battery_storage…jpg`
   - Smart meter `…Smart_meter…jpg`
   → MODEL FOR "Anatomy of a SkyShield roof system" (decking, underlayment, Titan XT, ridge vent, flashing).
3. **[03-process]** "Who does what?" — **8-step numbered process (01–08)** with role tags
   (Homeowner/Architect, Roofer, Electrician). → MODEL FOR the 5-phase insurance process.
4. **[04-faq]** "Got any questions? We've got the answers." — accordion FAQ (statics, orientation,
   manufacturers, watt/m², tiles/m²).
5. **[05-cta]** Configure-your-roof band. 6. **[footer]**.

---

## 3. Configurator — /configurator/
*Interactive multi-step tool (JS app; minimal static markup).*
- **[01-hero/intro]** "Configurator" + "Discover step by step: whether Autarq fits your project · how
  much of your electricity needs you can meet · roughly how much it will cost" → **"Let's go"** start
  button launching a stepper wizard.
- The rest is a dynamic quiz/wizard (roof, location, consumption → indicative offer). → MODEL FOR the
  SkyShield "Price My Roof / Free Inspection" multi-step funnel. *(Capture live if you want the wizard UI.)*

---

## 4. Autarq for Homeowner — /builder/
*Audience landing page. Model for a SkyShield homeowner-focused page.*

1. **[01-hero]** "Autarq solar roof solutions for **Homeowners**" — hero image `21_2880x1620…webp`
   (couple w/ VR). In-page anchor sub-nav: Seamless Design · Energy Independence · Maximum Flexibility
   · Long-term weather-resistance. **"Why Autarq?" bullet cluster** (Made in Europe; 25-yr guarantee;
   combine w/ regular tiles; future-proof).
2. **[02-design]** `01 Seamless Design` — before/after pair `23_…webp` / `24_…webp`.
3. **[03-independence]** `02 Energy independence` — two stat images with punchy figures:
   `25_…webp` "1 tile = 40 hours of PlayStation/yr"; `26_…webp` "40 m² = 25,000 km in an EV."
   → GREAT PATTERN: translate specs into relatable outcomes.
4. **[04-flexibility]** `03 Maximum flexibility` — image pair `22_…webp` / `27_…webp`.
5. **[05-resistance]** `04 Long-term weather resistance` — red-tile pair `28_…webp` / `29_…webp`
   ("walkable, snow-proof, class-5 hail").
6. **[06-steps]** "It's only a few steps to the next level." — 4 numbered steps + image `30_…webp`.
7. **[07-cards]** Two cards: The Autarq System (`31_…webp`) / Solar roof tiles (`32_…webp`).
8. **[08-cta]** Contact + Configure band. 9. **[footer]**.

---

## 5. Autarq for Roofer — /roofer/
*Trade audience page. Useful structure for a "Why a SkyShield roof" trust page.*

1. **[01-hero]** "Autarq solutions for **Roofers**" — hero `48_2880x1620…webp` (roofer laying tiles).
   Anchor sub-nav: Plug-and-play installation · Traditional workflow · Impermeable · Service-friendly.
   "Why Autarq?" bullets (Made in Europe; no electrical knowhow; digital + on-site support; installed
   like regular tiles).
2. **[02-installation]** `01 Plug-and-play installation` — **two looping videos** (`49…webm`, `50…webm`).
   → Note: uses short autoplay clips, not gifs.
3. **[03-workflow]** `02 Traditional workflow` — image `33_2880x1620…webp`.
4. **[04-impermeable]** `03 Impermeable` — image `34_…webp` + 3 expandable points (no roof
   penetration / installed as usual / undisturbed ventilation).
5. **[05-service]** `04 Service-friendly` — image pair `35_…webp` / `36_…webp`.
6. **[06-links]** "Take the first step" link list. 7. CTA band. 8. footer.

---

## 6. Autarq for Architect — /architect/
*Same audience-page template as Homeowner/Roofer.*

1. **[01-hero]** "Autarq solar roof solutions for **Architects**" — hero `37_2880x1620…webp` (architect
   at desk). Anchor sub-nav: Seamless design · Future-proof · Maximum Flexibility · Service-friendly.
   "Why Autarq?" bullets (Made in Europe; no foreign-object aesthetics; suitable for listed buildings;
   traditional workflow).
2. **[02-design]** `01 Seamless design` — tile images `38_…webp` / `39_…webp` (swatch row).
3. **[03-future]** `02 Future-proof` — streetscape `40_2880x1620…webp` + big-picture stat copy.
4. **[04-flexibility]** `03 Maximum flexibility` — image pair `22_…webp` / `27_…webp` (shared assets).
5. **[05-service]** `04 Service-friendly` — two looping videos (`49…webm`, `50…webm`).
6. **[06-links]** "Take the first step" link list (incl. brochure/data-sheet download).
7. CTA band. 8. footer.

> The three audience pages (Homeowner/Roofer/Architect) share ONE template: hero + "Why Autarq?"
> bullets + anchor sub-nav + four numbered sections + step/link block + CTA. Easy to replicate as a
> single reusable SkyShield audience-page layout.

---

## 7. Seeing is believing — /press/?tab=externalAudioVideo
*A tabbed Press & Media page; this tab = Audio & Video.*
1. **[01-hero]** "Press & Media" / "Autarq newsroom and media downloads."
2. **[02-tabs]** Tab bar: News · Autarq in the media · **Audio & Video** · Reports. (Content loads per
   tab via JS — the Audio & Video grid is dynamic; capture live if you need the gallery layout.)
3. **[03-news-list]** Date-stamped article list with "Load more."
4. **[04-presskit]** Press kit link + press contacts. 5. CTA band. 6. footer.
> For SkyShield this maps to a "See it in action" video/press gallery (your Higgsfield clips, drone
> footage, project videos) using the same tabbed layout.

---

## Recurring Autarq asset references worth grabbing
- 25-year warranty badge SVG: `https://autarq.com/uploads/25_years_warranty_regular_0c3b32ae42.svg`
- System key visual: `https://autarq.com/uploads/Key_Visual_Desktop_EN_64789fecb8.png`
- Before/after hero pair: `…/11_2880x1620_*.webp` (regular) & `…/10_2880x1620_*.webp` (solar)
- Awards strip logos: German Innovation, Red Dot, iF, German Design, Top100 (in footer).

*All images are © Autarq — use for design reference only, not on the live SkyShield site.*
