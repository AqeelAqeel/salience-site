# line-caster: Cold Email Generator

Generate personalized cold outreach emails for leads in the CRM and write them to the "Next Email to Send" column in the Google Sheet.

## Arguments
- `$ARGUMENTS` — Optional: "all" to generate for all leads missing emails, a specific company name, or a row number. Default: generate for all rows where "Next Email to Send" is empty and "Lead Status" is "New".

## Configuration
- **CRM Sheet**: https://docs.google.com/spreadsheets/d/15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs/edit?gid=188843465#gid=188843465
- **Spreadsheet ID**: `15GG0rrjOGQbErk17-gJ3x0T95T4N1XqegkpdpZA9fYs`
- **Firecrawl API Key**: In `.env.local` as `NEXT_FIRECRAWL_API_KEY`
- **Google Auth Credentials**: `.claude/commands/g-user-auth-client-secret.json`
- **Google Auth Token**: `scripts/.google-token.json`

## Workflow

### Step 1: Read CRM Data
```bash
SHEET_ID=$(cat scripts/.crm-sheet-id)
node scripts/sheets-client.mjs read "$SHEET_ID"
```

Parse all rows with headers.

### Step 2: Select Rows to Generate Emails For
Based on `$ARGUMENTS`:
- **default** — rows where "Next Email to Send" is empty AND "Lead Status" is "New"
- **"all"** — all rows where "Next Email to Send" is empty
- **company name** — matching row(s) only
- **row number** — specific row

### Step 3: For Each Selected Row, Generate a Cold Email

Using the CRM data for each lead, craft a personalized cold email following these principles:

**Email Structure:**
1. **Subject line** — Short, specific, curiosity-driven. Reference something specific about their business. No clickbait.
2. **Opening line** (1 sentence) — Reference something specific about their company, a recent project, their team, or their industry. Show you've done research. Never start with "I hope this email finds you well" or "My name is..."
3. **Value bridge** (1-2 sentences) — Connect their specific situation to what Salience offers. Be specific about the problem you can solve for them.
4. **Credibility marker** (1 sentence) — Brief social proof or relevant experience. Not a sales pitch.
5. **CTA** (1 sentence) — Soft, low-commitment ask. "Would it make sense to..." or "Open to a quick chat about..."
6. **Sign-off** — From "Aqeel Ali, Salience" with minimal signature.

**Personalization Sources** (use data from the row):
- Company name and description
- Team members (reference specific people if possible)
- Industry
- Key Info (tailor the pitch)
- LinkedIn URLs (shows you've looked them up)
- Location (mention if relevant)

**Tone Guidelines:**
- Conversational, not corporate
- Confident but not pushy
- Short paragraphs (1-2 sentences each)
- Total email: 4-7 sentences max
- No jargon, no buzzwords
- Sound like a real person, not a template

**What Salience Does** (for context in email generation):
Salience is a technology consultancy that builds custom software solutions, AI/ML implementations, and digital products. The team brings deep technical expertise across full-stack development, data engineering, and AI. Focus on concrete results and technical capability.

### Step 4: Format the Email
Format each email as:
```
Subject: <subject line>

<email body>
```

## CRM Column Layout (A-X)
A: Company Name, B: Website, C: Business Type, D: Industry, E: Location, F: Phone, G: Email, H: Address, I: Description, J: Team Members, K: LinkedIn URLs, L: Social Media, M: Key Info, N: Misc Notes, O: Recent Biz Activity, P: Recent Socials Activity, Q: Lead Source, R: Lead Status, S: Last Updated, T: Next Email to Send, U: Email Status, V: Enrichment Notes, W: Enrichment Timestamp, X: Enrichment Action

### Step 5: Write Emails to Sheet
For each row, update the "Next Email to Send" column (column T) and set "Email Status" (column U) to "Draft":

```bash
echo '[["<email_text>", "Draft"]]' > /tmp/crm-email.json
node scripts/sheets-client.mjs update "$SHEET_ID" "CRM!T<row>:U<row>" /tmp/crm-email.json
```

### Step 7: Report Results
Show the user:
- Number of emails generated
- For each email: company name and the full email draft
- Ask the user to review before sending
- Remind them emails are saved as "Draft" status — they can mark as "Sent" after sending

## Email Quality Rules
- NEVER use generic templates. Every email must reference specific details from the CRM row.
- If a row has minimal data (no description, no team members), flag it for enrichment first rather than generating a weak email.
- If team member names are available, address the email to a specific person.
- Keep subject lines under 50 characters.
- No exclamation marks in subject lines.
- No "we" in the first sentence — lead with "you/your".

## Important Notes
- Always show generated emails to the user for review
- Emails go into the sheet as "Draft" — never "Sent"
- If the row data is too thin for a good personalized email, skip it and recommend running scan-fil-crm first
- The user should review and potentially edit emails in the sheet before sending
