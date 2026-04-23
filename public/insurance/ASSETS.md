# Insurance Section — Asset Pipeline

All images for `/services#insurance` live here.

```
/public/insurance/
  logos/          third-party tool logos the audience already knows
  infographics/   AI-generated infographics, flow stages, hero art
```

Components render by filename. Missing files fall back to a styled
`ArtPlaceholder` so the page always looks shipped — swap real assets in as
they're generated.

---

## 1. Third-party logos (`/logos/`)

These are the tools insurance agencies already use. Do **not** generate these
with AI — download the official brand mark (PNG, transparent bg) from each
vendor's press/brand page and drop in with the filenames below.

### Agency management systems

| Filename | Source |
| --- | --- |
| `logos-hawksoft.png` | https://www.hawksoft.com/ (brand assets) |
| `logos-ezlynx.png` | https://www.ezlynx.com/ |
| `logos-applied-epic.png` | https://www1.appliedsystems.com/ |
| `logos-ams360.png` | https://www.vertafore.com/ |
| `logos-nowcerts.png` | https://nowcerts.com/ |
| `logos-qqcatalyst.png` | https://www.qqsolutions.com/ |

### Email / inbox

| Filename | Source |
| --- | --- |
| `logos-gmail.png` | https://about.google/brand-resource-center/ |
| `logos-outlook.png` | Microsoft trademark page |

### Phone / SMS / calling

| Filename | Source |
| --- | --- |
| `logos-ringcentral.png` | https://www.ringcentral.com/ |
| `logos-twilio.png` | https://www.twilio.com/brand |
| `logos-google-voice.png` | Google brand center |

### Intake + forms + scheduling

| Filename | Source |
| --- | --- |
| `logos-acord.png` | https://www.acord.org/ |
| `logos-typeform.png` | https://www.typeform.com/press/ |
| `logos-jotform.png` | https://www.jotform.com/press/ |
| `logos-google-calendar.png` | Google brand center |
| `logos-calendly.png` | https://calendly.com/ |

### Carriers (optional, for the Agency Intelligence visual)

Any mix of: Progressive, Liberty Mutual, Travelers, Chubb, The Hartford,
Nationwide, Safeco, Auto-Owners, Berkshire Hathaway Guard. Grab from
each carrier's agent/producer portal brand page.

Target dimensions for all logos: ~96×96 px, square crop, transparent bg.

---

## 2. Client-flow stages (`/infographics/flow-stage-*.png`)

The horizontal pipeline (`ClientFlow` component) has four illustrated stage
cards. Each is a ~4:3 card-sized illustration.

### `flow-stage-1-prospect.png` — "Prospect in"

> **Prompt:** Clean minimal isometric vector illustration. A single business
> professional silhouette (gender-neutral, modern attire) walking confidently
> through an arched doorway into a glowing room. Behind them: a soft gradient
> of incoming arrows labeled subtly "web form", "phone", "referral". Above their
> head: a small "+1" badge indicating new headcount captured. Color palette:
> cool blues and off-white, one warm amber accent on the doorway. Apple/Stripe
> marketing illustration style. No text clutter. 4:3 aspect ratio.

### `flow-stage-2-capture.png` — "Info captured"

> **Prompt:** Isometric vector illustration of an AI scanner. A soft glowing
> iridescent beam (rainbow-eye motif) reads data fields off a translucent
> floating profile card — name, DOB, vehicle, property details — and routes
> them through thin gradient wires into a grid of six ACORD-style forms that
> auto-populate themselves with blue check marks. Warm amber gradient light.
> Clean off-white background, 4:3. Apple keynote aesthetic.

### `flow-stage-3-underwrite.png` — "Policy underwritten"

> **Prompt:** Isometric vector illustration of a central policy document being
> signed and sealed. Around it, three floating carrier-branded shields (generic,
> not real brands) beam competitive quote lines back toward the document. A
> finalizing stamp descends onto the policy with a soft emerald glow. An AI
> agent (thin iridescent figure) orchestrates from above. Palette: emerald,
> blue, warm off-white. 4:3.

### `flow-stage-4-revenue.png` — "Firm earns more"

> **Prompt:** Isometric vector illustration of a modern agency office. A rising
> bar chart and smooth upward arrow emerging from the top of a glowing cube
> labeled "book of business". Next to it, a commission ticker showing "$" pills
> accumulating. Calm, clean, successful atmosphere. Rose/amber accent on the
> chart, cool blue office background. 4:3. Modern SaaS illustration, not
> cartoonish.

---

## 3. Salient-hub + supporting infographics (`/infographics/`)

### `infographics-salient-hub.png`
Central hero diagram — "Your Salient System" orb with 6 radial nodes.
*(Used as fallback/reference; the rendered hub is drawn in SVG so the PNG is
optional.)*

> **Prompt:** Minimal tech infographic, off-white background. Center: glowing
> iridescent orb labeled "Your Salient System" with a rainbow-eye motif. Six
> connected nodes around it: Agency Management, Email, Phone, Intake Forms,
> Renewals, Carrier Intelligence. Thin curved gradient connecting lines
> (blue → amber). Each node is a rounded white card with a soft blue shadow.
> Linear.app / Apple keynote aesthetic. 3:2.

### `infographics-unified-system.png`
"Bring all your subscriptions into one" — chaos-to-calm split.

> **Prompt:** Split illustration, left-to-right transformation. LEFT:
> chaotic pile of 12+ small generic SaaS app icons scattered on a cluttered
> desk, tangled wires, overflowing inboxes, muted grays. RIGHT: a single calm
> glowing orb on a clean minimalist desk, soft blue + warm amber light, one
> monitor showing a unified dashboard. A curved arrow labeled "unify" bridges
> both sides. Editorial vector illustration, 2026 SaaS marketing aesthetic.

### Optional — `infographics-cycle-hero.png`
A wide cinematic loop visualization if we ever want to anchor the Client Flow
section with a background hero.

> **Prompt:** Wide cinematic illustration of a continuous circular pipeline: a
> small human silhouette enters at the left, transforms into a data card, then
> a signed policy, then a growing revenue chart, then loops back as a
> satisfied client returning for renewal. Thin iridescent rainbow line
> connecting all stages in an infinity-loop. Off-white background, cool
> blue/warm amber duotone. Minimalist Apple-style vector, 21:9.

---

## 4. Feature-pillar cards (`/infographics/infographics-*.png`)

One illustration per pillar on the services insurance section.

- `infographics-intake-flow.png` — see "Intake" prompt in repo history / generate from the flow-stage-2 prompt above.
- `infographics-form-processing.png` — six carrier PDFs auto-filling in parallel, single data source glowing orb connected by light beams.
- `infographics-247-updates.png` — day/night clock cycle with AI orb responding to client messages across 24h.
- `infographics-renewals.png` — calendar morphing into a timeline with automatic "renewed ✓" cards above each date.
- `infographics-agency-intelligence.png` — dashboard with commissions chart, carrier appetite heatmap, book breakdown pie.

(These are referenced in the Five Pillars section. Style: Stripe/Linear
dashboard illustration aesthetic, off-white bg, blue/amber accents, 3:2 or 4:3.)

---

## 5. File naming convention

`<subdir>-<slug>.<ext>` — matches the existing `/public/assets/` and
`/public/industries/` convention. Components import by literal path; renaming
a file breaks the render.

## 6. Generation tips

- Use **Midjourney v6** or **Ideogram** for the illustrations (they handle
  isometric vector/SaaS aesthetics best).
- For logos, always prefer the official brand asset (press kit / media page).
  Don't trace or re-generate — it looks off.
- Keep palette consistent: **#60a5fa** (blue-400), **#f59e0b** (amber-500),
  **#10b981** (emerald-500), **#e11d48** (rose-600) as accents on an
  off-white `#fafafa` base.
- Export at 2× the displayed size (so 1600×1200 for a 4:3 card that renders
  at 800×600) for crisp retina rendering.
