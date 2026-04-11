#!/usr/bin/env node
/**
 * Firecrawl API client for business search and website scraping.
 *
 * Commands:
 *   node scripts/firecrawl-client.mjs search "query"
 *   node scripts/firecrawl-client.mjs scrape "https://example.com"
 *   node scripts/firecrawl-client.mjs map "https://example.com"
 *
 * Requires NEXT_FIRECRAWL_API_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Missing .env.local');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

loadEnv();

const API_KEY = process.env.NEXT_FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('❌ NEXT_FIRECRAWL_API_KEY not set in .env.local');
  process.exit(1);
}

const BASE_URL = 'https://api.firecrawl.dev/v1';

async function firecrawlFetch(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firecrawl API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function search(query, options = {}) {
  const result = await firecrawlFetch('/search', {
    query,
    limit: options.limit || 10,
    lang: options.lang || 'en',
    country: options.country || 'us',
    scrapeOptions: {
      formats: ['markdown'],
      onlyMainContent: true,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

async function scrape(url, options = {}) {
  const result = await firecrawlFetch('/scrape', {
    url,
    formats: ['markdown'],
    onlyMainContent: options.onlyMainContent !== false,
    waitFor: options.waitFor || 2000,
  });

  console.log(JSON.stringify(result, null, 2));
}

async function map(url) {
  const result = await firecrawlFetch('/map', {
    url,
    limit: 50,
  });

  console.log(JSON.stringify(result, null, 2));
}

// CLI dispatch
const [,, command, ...args] = process.argv;

switch (command) {
  case 'search':
    await search(args[0], args[1] ? JSON.parse(args[1]) : {});
    break;
  case 'scrape':
    await scrape(args[0], args[1] ? JSON.parse(args[1]) : {});
    break;
  case 'map':
    await map(args[0]);
    break;
  default:
    console.error('Usage: firecrawl-client.mjs <search|scrape|map> [args...]');
    process.exit(1);
}
