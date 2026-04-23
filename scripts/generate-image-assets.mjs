#!/usr/bin/env node
// Generate insurance-section image assets via xAI grok-imagine-image.
// See public/insurance/ASSETS.md for prompt rationale + manifest parity.
//
// Usage:
//   node scripts/generate-image-assets.mjs --list
//   node scripts/generate-image-assets.mjs --only flow-1
//   node scripts/generate-image-assets.mjs --only flow           # matches ids starting with "flow"
//   node scripts/generate-image-assets.mjs                       # generate everything missing
//   node scripts/generate-image-assets.mjs --force               # regenerate everything
//   node scripts/generate-image-assets.mjs --size 1024           # default 2048
//   node scripts/generate-image-assets.mjs --dry-run
//
// Requires: NEXT_XAI_API_KEY in .env.local

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// ── env ────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, k, rawVal] = m;
    if (process.env[k] !== undefined) continue;
    const val = rawVal.replace(/^['"]|['"]$/g, '');
    process.env[k] = val;
  }
}
loadEnvFile(resolve(PROJECT_ROOT, '.env.local'));

const API_KEY = process.env.NEXT_XAI_API_KEY;
if (!API_KEY) {
  console.error('✗ Missing NEXT_XAI_API_KEY in .env.local');
  process.exit(1);
}

const ENDPOINT = 'https://api.x.ai/v1/images/generations';
const MODEL = 'grok-imagine-image';
const PRICE_PER_IMAGE = 0.02;

// ── manifest ───────────────────────────────────────────────────────────────
// id → aspect is a hint for composition; xAI grok-imagine-image outputs square,
// and component slots use object-cover to crop. Keep prompts terse but specific.

const MANIFEST = [
  // Client-flow pipeline stages
  {
    id: 'flow-1',
    path: 'public/insurance/infographics/flow-stage-1-prospect.png',
    aspect: '4:3',
    prompt:
      'Clean minimal isometric vector illustration. A single gender-neutral business professional silhouette in modern attire walks confidently through an arched doorway into a softly glowing room. Behind them, soft gradient arrows subtly labeled "web form", "phone", "referral" converge toward the door. Above their head a small "+1" badge indicates a new headcount captured. Palette: cool blues and off-white, one warm amber accent on the doorway glow. Apple / Stripe marketing illustration style, no text clutter, crisp vector, off-white background.',
  },
  {
    id: 'flow-2',
    path: 'public/insurance/infographics/flow-stage-2-capture.png',
    aspect: '4:3',
    prompt:
      'Isometric vector illustration of an AI scanner. A soft glowing iridescent beam with a rainbow-eye motif reads data fields off a translucent floating client profile card (name, DOB, vehicle, property). Thin gradient wires route the data into a grid of six ACORD-style forms that auto-populate with blue check marks. Warm amber gradient light, cool blue accents, clean off-white background. Apple keynote aesthetic, crisp vector, no placeholder text.',
  },
  {
    id: 'flow-3',
    path: 'public/insurance/infographics/flow-stage-3-underwrite.png',
    aspect: '4:3',
    prompt:
      'Isometric vector illustration. A central insurance policy document being signed and sealed. Around it three floating generic carrier shields (no real brands) beam competitive quote lines back toward the document. A finalizing stamp descends with a soft emerald glow. A thin iridescent AI agent figure orchestrates from above. Palette: emerald, blue, warm off-white. Modern SaaS illustration, no cartoon, off-white background.',
  },
  {
    id: 'flow-4',
    path: 'public/insurance/infographics/flow-stage-4-revenue.png',
    aspect: '4:3',
    prompt:
      'Isometric vector illustration of a modern insurance agency office. A rising bar chart and smooth upward arrow emerge from the top of a glowing cube labeled "book of business". Beside it a commission ticker with "$" pills accumulating. Calm, successful atmosphere. Rose/amber accent on the chart, cool blue office ambience. Modern SaaS illustration, not cartoonish, off-white background.',
  },

  // Feature-pillar cards
  {
    id: 'pillar-intake',
    path: 'public/insurance/infographics/infographics-intake-flow.png',
    aspect: '4:3',
    prompt:
      'Isometric minimalist illustration of an AI intake pipeline. A phone call, web form, and email envelope icon on the left all flow into a central processing core represented as a rainbow-gradient iridescent eye. The core outputs a fully populated ACORD form on the right. Small floating data fields (name, DOB, policy #) captured mid-air. Off-white background, blue/amber accent palette, flat vector.',
  },
  {
    id: 'pillar-forms',
    path: 'public/insurance/infographics/infographics-form-processing.png',
    aspect: '3:2',
    prompt:
      'Top-down view of six different generic carrier application PDFs fanned out on a desk, all simultaneously filling themselves in with a soft blue glow trailing across the form fields. A single glowing orb data source connects to each form with soft light beams. A pen lies unused next to the forms. Modern SaaS illustration, Apple/Stripe aesthetic, off-white background.',
  },
  {
    id: 'pillar-247',
    path: 'public/insurance/infographics/infographics-247-updates.png',
    aspect: '1:1',
    prompt:
      'Circular clock-style infographic showing a day-night cycle. An iridescent rainbow-eye AI orb at the center responds to client messages — SMS bubbles and email envelopes positioned around the clock face at 2am, 6am, noon, 9pm, midnight. Soft gradient background transitioning from dawn blue to sunset amber. Minimal flat vector, modern, square composition.',
  },
  {
    id: 'pillar-renewals',
    path: 'public/insurance/infographics/infographics-renewals.png',
    aspect: '3:2',
    prompt:
      'Calendar grid morphing into a horizontal timeline. Multiple policy renewal dates highlighted with small glowing markers; above each a tiny card reading "renewed ✓" being handled automatically. A thin iridescent AI line weaves through the timeline connecting renewals. Off-white background, blue/amber accents, editorial vector illustration.',
  },
  {
    id: 'pillar-intel',
    path: 'public/insurance/infographics/infographics-agency-intelligence.png',
    aspect: '16:9',
    prompt:
      'Dashboard-style infographic with three panels. Left: clean commissions chart with upward trend. Middle: carrier appetite heatmap (grid of generic carrier badges with green/yellow/red competitiveness dots). Right: book-of-business breakdown pie chart. Unified under a single "Salient Intelligence" header bar. Modern SaaS dashboard illustration, Stripe/Linear aesthetic, crisp, off-white background.',
  },

  // Unify banner + cycle hero
  {
    id: 'unified-system',
    path: 'public/insurance/infographics/infographics-unified-system.png',
    aspect: '4:3',
    prompt:
      'Split illustration, left-to-right transformation. LEFT: chaotic pile of 12+ small generic SaaS app icons scattered on a cluttered desk, tangled wires, overflowing inboxes, muted grays. RIGHT: a single calm glowing iridescent orb on a clean minimalist desk, soft blue and warm amber light, one monitor showing a unified dashboard. A curved arrow labeled "unify" bridges both sides. Editorial vector illustration, 2026 SaaS marketing aesthetic.',
  },
  {
    id: 'salient-hub',
    path: 'public/insurance/infographics/infographics-salient-hub.png',
    aspect: '3:2',
    prompt:
      'Minimal tech infographic on an off-white background. Center: a glowing iridescent orb labeled "Your Salient System" with a subtle rainbow-eye motif. Six connected rounded white node cards around it: Agency Management, Email, Phone, Intake Forms, Renewals, Carrier Intelligence. Thin curved gradient connecting lines transitioning blue to amber. Each node card has a soft blue shadow. Linear.app / Apple keynote aesthetic.',
  },
  {
    id: 'cycle-hero',
    path: 'public/insurance/infographics/infographics-cycle-hero.png',
    aspect: '16:9',
    prompt:
      'Wide cinematic illustration of a continuous circular pipeline. A small human silhouette enters at the left, transforms into a data card, then a signed policy, then a growing revenue chart, then loops back as a satisfied returning client for renewal. A thin iridescent rainbow infinity line connects every stage. Off-white background, cool blue + warm amber duotone, minimalist Apple-style vector.',
  },
];

// ── cli ────────────────────────────────────────────────────────────────────
const { values } = parseArgs({
  options: {
    only: { type: 'string' },
    force: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    list: { type: 'boolean', default: false },
    size: { type: 'string', default: '2048' },
  },
});

if (values.list) {
  console.log(`\n${MANIFEST.length} assets in manifest:\n`);
  for (const a of MANIFEST) {
    const exists = existsSync(resolve(PROJECT_ROOT, a.path)) ? '✓' : ' ';
    console.log(`  ${exists}  ${a.id.padEnd(18)} ${a.aspect.padEnd(6)} ${a.path}`);
  }
  console.log('');
  process.exit(0);
}

const size = `${values.size}x${values.size}`;

const tasks = values.only
  ? MANIFEST.filter(
      (a) => a.id === values.only || a.id.startsWith(values.only),
    )
  : MANIFEST;

if (tasks.length === 0) {
  console.error(`✗ No assets match --only="${values.only}". Try --list.`);
  process.exit(1);
}

// ── generate ───────────────────────────────────────────────────────────────
async function generateOne(asset) {
  const body = {
    model: MODEL,
    prompt: asset.prompt,
    n: 1,
    response_format: 'b64_json',
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`xAI ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = await res.json();
  const item = json?.data?.[0];
  if (!item) throw new Error(`Empty response: ${JSON.stringify(json).slice(0, 300)}`);

  if (item.b64_json) {
    return Buffer.from(item.b64_json, 'base64');
  }
  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status} from ${item.url}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error(`No b64_json or url in response: ${JSON.stringify(item).slice(0, 200)}`);
}

async function main() {
  const header = values['dry-run'] ? '[DRY RUN] ' : '';
  console.log(
    `${header}Generating ${tasks.length} asset${tasks.length === 1 ? '' : 's'} at ${size} ` +
      `($${(tasks.length * PRICE_PER_IMAGE).toFixed(2)} max at $${PRICE_PER_IMAGE}/image)\n`,
  );

  let spent = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of tasks) {
    const abs = resolve(PROJECT_ROOT, asset.path);
    const label = `${asset.id.padEnd(18)} ${asset.aspect.padEnd(6)} ${asset.path}`;

    if (!values.force && existsSync(abs)) {
      console.log(`  skip  ${label}`);
      skipped++;
      continue;
    }

    if (values['dry-run']) {
      console.log(`  would ${label}`);
      continue;
    }

    process.stdout.write(`  gen   ${label} ... `);
    try {
      const buf = await generateOne(asset);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, buf);
      spent += PRICE_PER_IMAGE;
      generated++;
      console.log(`✓ (${(buf.length / 1024).toFixed(0)} KiB)`);
    } catch (err) {
      failed++;
      console.log(`✗`);
      console.error(`        └─ ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(
    `\nDone. generated=${generated}  skipped=${skipped}  failed=${failed}  ` +
      `spend≈$${spent.toFixed(2)}`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
