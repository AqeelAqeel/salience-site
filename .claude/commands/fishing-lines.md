# fishing-lines: Business Search & Lead Generation

Search for businesses in a geographic area, extract contact information, team members, social media profiles, and populate the CRM Google Sheet with new leads.

## Arguments
- `$ARGUMENTS` — A natural language query describing the location and type of businesses to find. Example: "marketing agencies in Austin, TX" or "law firms in downtown Chicago"

## Configuration
- **CRM Sheet**: https://docs.google.com/spreadsheets/d/15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs/edit?gid=188843465#gid=188843465
- **Spreadsheet ID**: `15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs`
- **Firecrawl API Key**: In `.env.local` as `NEXT_FIRECRAWL_API_KEY`
- **Google Auth Credentials**: `.claude/commands/g-user-auth-client-secret.json`
- **Google Auth Token**: `scripts/.google-token.json`

## Workflow

### Step 1: Parse the Query
Extract from `$ARGUMENTS`:
- **Business type / industry** (e.g., "marketing agencies", "law firms", "SaaS companies")
- **Geographic area** (e.g., "Austin, TX", "downtown Chicago", "Bay Area")
- **Any filters** (e.g., "small", "enterprise", "B2B")

### Step 2: Search for Businesses
Use the Firecrawl search API to find businesses matching the query:

```bash
node scripts/firecrawl-client.mjs search "<business type> in <location> contact information"
```

Run multiple search variations to maximize coverage:
1. `"<business type> in <location>"` — primary search
2. `"<business type> <location> team about us"` — to find team pages
3. `"top <business type> near <location> directory"` — directory listings

### Step 3: For Each Business Found
For each result from the search:

1. **Extract basic info** from the search result markdown:
   - Company name
   - Website URL
   - Description/summary
   - Phone, email, address if visible

2. **Deep scrape the company website** for contact details:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<website_url>"
   ```

3. **Map the site** to find team/about/contact pages:
   ```bash
   node scripts/firecrawl-client.mjs map "<website_url>"
   ```

4. **Scrape team/about/contact pages** found from the map:
   ```bash
   node scripts/firecrawl-client.mjs scrape "<team_page_url>"
   ```

5. **Extract from scraped content**:
   - Team member names and titles
   - LinkedIn profile URLs (pattern: `linkedin.com/in/...`)
   - Twitter/X handles
   - Other social media links
   - Email addresses (pattern: `*@*.*`)
   - Phone numbers
   - Physical address
   - Company description and key offerings

### Step 4: Read Existing CRM Data
```bash
SHEET_ID=$(cat scripts/.crm-sheet-id)
node scripts/sheets-client.mjs read "$SHEET_ID"
```

Check for duplicates by matching on company name or website URL. Skip businesses already in the sheet.

## CRM Column Layout (A-X)
A: Company Name, B: Website, C: Business Type, D: Industry, E: Location, F: Phone, G: Email, H: Address, I: Description, J: Team Members, K: LinkedIn URLs, L: Social Media, M: Key Info, N: Misc Notes, O: Recent Biz Activity, P: Recent Socials Activity, Q: Lead Source, R: Lead Status, S: Last Updated, T: Next Email to Send, U: Email Status, V: Enrichment Notes, W: Enrichment Timestamp, X: Enrichment Action

### Step 5: Prepare and Append New Rows
For each NEW lead, create a row with these columns (in order):
1. **Company Name**
2. **Website**
3. **Business Type** — e.g. "Insurance Broker", "Marketing Agency", etc.
4. **Industry** — broader category
5. **Location** — city, state
6. **Phone** — primary phone number
7. **Email** — primary contact email
8. **Address** — full street address
9. **Description** — brief company description
10. **Team Members** — semicolon-separated list of "Name (Title)"
11. **LinkedIn URLs** — semicolon-separated LinkedIn profile URLs
12. **Social Media** — semicolon-separated other social links
13. **Key Info** — notable details (company size, specialties, notable clients)
14. **Misc Notes** — anything else relevant
15. **Recent Biz Activity** — leave empty (scan-fil-crm fills this)
16. **Recent Socials Activity** — leave empty (scan-fil-crm fills this)
17. **Lead Source** — "fishing-lines: <original query>"
18. **Lead Status** — "New"
19. **Last Updated** — current ISO date
20. **Next Email to Send** — leave empty (line-caster fills this)
21. **Email Status** — "Not Started"
22. **Enrichment Notes** — sources used, scrape quality notes
23. **Enrichment Timestamp** — current ISO timestamp
24. **Enrichment Action** — "fishing-lines: Added new lead"

Write the rows to a temp JSON file and append:
```bash
echo '<json_array_of_rows>' > /tmp/crm-new-leads.json
node scripts/sheets-client.mjs append "$SHEET_ID" /tmp/crm-new-leads.json
```

### Step 6: Report Results
Summarize to the user:
- Number of businesses found
- Number of new leads added (excluding duplicates)
- Any businesses that couldn't be scraped
- Quick table of the new leads added

## Important Notes
- Respect rate limits: pause briefly between Firecrawl API calls
- If a site blocks scraping, note it in Enrichment Notes and move on
- Always check for duplicates before appending
- LinkedIn URLs are high-value — prioritize extracting these
- If the sheet ID file doesn't exist, prompt the user to run the setup or create the sheet first
