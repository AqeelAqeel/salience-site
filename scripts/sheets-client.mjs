#!/usr/bin/env node
/**
 * Google Sheets client utility for CRM operations.
 *
 * Commands:
 *   node scripts/sheets-client.mjs create "Sheet Title"
 *   node scripts/sheets-client.mjs read <spreadsheetId> [range]
 *   node scripts/sheets-client.mjs append <spreadsheetId> <jsonRowsFile>
 *   node scripts/sheets-client.mjs update <spreadsheetId> <range> <jsonDataFile>
 *   node scripts/sheets-client.mjs get-headers <spreadsheetId>
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '.google-token.json');

const CRM_HEADERS = [
  'Company Name',
  'Website',
  'Business Type',
  'Industry',
  'Location',
  'Phone',
  'Email',
  'Address',
  'Description',
  'Team Members',
  'LinkedIn URLs',
  'Social Media',
  'Key Info',
  'Misc Notes',
  'Recent Biz Activity',
  'Recent Socials Activity',
  'Lead Source',
  'Lead Status',
  'Last Updated',
  'Next Email to Send',
  'Email Status',
  'Enrichment Notes',
  'Enrichment Timestamp',
  'Enrichment Action',
];

function getAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
    console.error('❌ Not authenticated. Run: node scripts/google-auth-setup.mjs');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3333/oauth2callback'
  );
  oauth2Client.setCredentials(tokens);

  // Auto-refresh token if expired
  oauth2Client.on('tokens', (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
  });

  return oauth2Client;
}

async function createSheet(title) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [
        {
          properties: { title: 'CRM', index: 0 },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: CRM_HEADERS.map((h) => ({
                    userEnteredValue: { stringValue: h },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.15, green: 0.15, blue: 0.2 },
                    },
                  })),
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'Enrichment Log', index: 1 },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: ['Timestamp', 'Action', 'Company', 'Details', 'Status'].map((h) => ({
                    userEnteredValue: { stringValue: h },
                    userEnteredFormat: { textFormat: { bold: true } },
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const spreadsheetId = res.data.spreadsheetId;
  const url = res.data.spreadsheetUrl;
  const crmSheetId = res.data.sheets[0].properties.sheetId;

  // Freeze header row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: crmSheetId,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: crmSheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: CRM_HEADERS.length,
            },
          },
        },
      ],
    },
  });

  console.log(JSON.stringify({ spreadsheetId, url, title, headers: CRM_HEADERS }));
}

async function readSheet(spreadsheetId, range = 'CRM!A:X') {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  console.log(JSON.stringify(res.data.values || []));
}

async function appendRows(spreadsheetId, jsonFile) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const rows = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'CRM!A:X',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  console.log(JSON.stringify({
    updatedRows: res.data.updates.updatedRows,
    updatedRange: res.data.updates.updatedRange,
  }));
}

async function updateCells(spreadsheetId, range, jsonFile) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: data },
  });

  console.log(JSON.stringify({
    updatedCells: res.data.updatedCells,
    updatedRange: res.data.updatedRange,
  }));
}

async function getHeaders(spreadsheetId) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'CRM!1:1',
  });

  console.log(JSON.stringify(res.data.values?.[0] || []));
}

// CLI dispatch
const [,, command, ...args] = process.argv;

switch (command) {
  case 'create':
    await createSheet(args[0] || 'Salience CRM');
    break;
  case 'read':
    await readSheet(args[0], args[1]);
    break;
  case 'append':
    await appendRows(args[0], args[1]);
    break;
  case 'update':
    await updateCells(args[0], args[1], args[2]);
    break;
  case 'get-headers':
    await getHeaders(args[0]);
    break;
  default:
    console.error('Usage: sheets-client.mjs <create|read|append|update|get-headers> [args...]');
    process.exit(1);
}
