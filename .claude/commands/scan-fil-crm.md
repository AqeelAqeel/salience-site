# scan-fil-crm: CRM Enrichment & Update

Scan existing CRM entries, re-enrich them with fresh data from their websites, scan social media activity, and update the Google Sheet. Designed to run weekly to keep lead data current.

## Arguments
- `$ARGUMENTS` — Optional filters: "all", "stale" (default, entries older than 7 days), or a specific company name to re-enrich.

## Configuration
- **CRM Sheet**: https://docs.google.com/spreadsheets/d/15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs/edit?gid=188843465#gid=188843465
- **Spreadsheet ID**: `15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs`
- **Firecrawl API Key**: In `.env.local` as `NEXT_FIRECRAWL_API_KEY`
- **Google Auth Credentials**: `.claude/commands/g-user-auth-client-secret.json`
- **Google Auth Token**: `scripts/.google-token.json`

## CRM Column Layout (A-X)
A: Company Name, B: Website, C: Business Type, D: Industry, E: Location, F: Phone, G: Email, H: Address, I: Description, J: Team Members, K: LinkedIn URLs, L: Social Media, M: Key Info, N: Misc Notes, O: Recent Biz Activity, P: Recent Socials Activity, Q: Lead Source, R: Lead Status, S: Last Updated, T: Next Email to Send, U: Email Status, V: Enrichment Notes, W: Enrichment Timestamp, X: Enrichment Action

## Workflow

### Step 1: Read Current CRM Data
```bash
node scripts/sheets-client.mjs read "15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs"
```

Parse the response into structured rows. Note the header row for column mapping.

### Step 2: Determine Which Rows to Update
Based on `$ARGUMENTS`:
- **"all"** — process every row
- **"stale"** (default) — only rows where "Last Updated" is older than 7 days or empty
- **specific company** — only rows matching the company name

### Step 3: For Each Row — Re-scrape Website
For each selected row:

1. **Re-scrape the company website**:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<website_from_row>"
   ```

2. **Map the site for updated pages**:
   ```bash
   node scripts/firecrawl-client.mjs map "<website_from_row>"
   ```

3. **Scrape team/about/contact pages** if found:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<team_or_contact_page>"
   ```

### Step 4: For Each Row — Scan Recent Business Activity
Search for recent news, blog posts, press releases, or announcements:

```bash
node scripts/firecrawl-client.mjs search "<company_name> news OR announcement OR press release 2026"
```

Extract and summarize into the **Recent Biz Activity** column (O):
- Recent blog posts or articles published by the company
- Press releases or news mentions
- New hires, expansions, awards
- New product/service launches
- Partnerships or acquisitions
- Format as semicolon-separated items with dates: "2026-03: Expanded to new office; 2026-02: Launched cyber insurance product"

### Step 5: For Each Row — Scan Social Media Activity
For each company, search and scrape their social media presence:

1. **Find social profiles** from the Social Media column, or search:
   ```bash
   node scripts/firecrawl-client.mjs search "<company_name> site:linkedin.com OR site:twitter.com OR site:facebook.com OR site:instagram.com"
   ```

2. **Scrape company LinkedIn page** (if URL known):
   ```bash
   node scripts/firecrawl-client.mjs scrape "<linkedin_company_url>"
   ```

3. **Scrape team member LinkedIns** from the LinkedIn URLs column:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<linkedin_profile_url>"
   ```

4. **Scrape Facebook/Instagram/Twitter** pages if found:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<social_media_url>"
   ```

Extract and summarize into the **Recent Socials Activity** column (P):
- Recent LinkedIn posts by the company or team members
- Twitter/X posts or threads
- Facebook/Instagram activity
- Content themes (what they talk about, what they share)
- Engagement levels (if visible)
- Format as semicolon-separated items: "LinkedIn: CEO posted about AI in insurance 3/25; Twitter: shared industry report 3/20; Instagram: office event photos 3/18"

### Step 6: Compare and Merge Data
For each row, compare new data with existing:
- **Never overwrite** manually-entered data (check Enrichment Notes for "manual" flag)
- **Append** new team members not already listed
- **Update** phone/email/address if the existing fields are empty or the new data is more complete
- **Add** any new LinkedIn URLs or social media links found
- **Update** Description if the new one is more detailed
- **Update** Key Info with any new findings
- **Always update** Recent Biz Activity and Recent Socials Activity with fresh data
- **Always update** Last Updated to current ISO date
- **Update** Enrichment Timestamp and Enrichment Action inline
- **Append** to Enrichment Notes: "Re-enriched on <date>: <what changed>"

### Step 7: Write Updates Back to Sheet
For each updated row, write back to the specific range:
```bash
echo '<updated_row_data>' > /tmp/crm-update.json
node scripts/sheets-client.mjs update "15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs" "CRM!A<row_num>:X<row_num>" /tmp/crm-update.json
```

### Step 8: Report Results
Summarize to the user:
- Total rows scanned
- Rows updated vs unchanged
- Key changes found (new team members, updated contacts, etc.)
- Recent biz activity highlights
- Recent social media activity highlights
- Any rows that errored (site down, blocked, etc.)
- Table showing what changed for each updated row

## Enrichment Checklist
For each business, attempt to extract/update:
- [ ] Current phone number(s)
- [ ] Current email address(es)
- [ ] Physical address
- [ ] Team members and their titles
- [ ] LinkedIn profiles for team members
- [ ] Twitter/X, Instagram, Facebook links
- [ ] Company description / value proposition
- [ ] Notable clients or case studies
- [ ] Company size indicators
- [ ] Recent news or updates → **Recent Biz Activity**
- [ ] Recent social media posts/engagement → **Recent Socials Activity**
- [ ] Tech stack (if visible)

## Important Notes
- Everything lives in one sheet tab (CRM) — no separate enrichment log tab
- Enrichment history is tracked inline via columns V-X
- Respect Firecrawl rate limits — add a brief pause between calls
- Keep a running count of API calls made for the user
- If a site is unreachable, note in Enrichment Notes but don't clear existing data
- The "Last Updated" field is critical — always set it on any touched row
- Social media scraping may be limited — note what was accessible vs blocked in Enrichment Notes
