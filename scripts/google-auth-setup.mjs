#!/usr/bin/env node
/**
 * One-time Google OAuth2 setup for Sheets API access.
 *
 * Usage:
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project (or use existing)
 *   3. Enable "Google Sheets API" and "Google Drive API"
 *   4. Create OAuth2 credentials (Desktop app type)
 *   5. Download the credentials JSON and save as scripts/google-credentials.json
 *   6. Run: node scripts/google-auth-setup.mjs
 *   7. Follow the browser flow to authorize with aqeel@aqeelali.com
 *
 * This saves a token to scripts/.google-token.json for reuse by other scripts.
 */

import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '.google-token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`\n❌ Missing ${CREDENTIALS_PATH}`);
    console.error(`\nSetup steps:`);
    console.error(`  1. Go to https://console.cloud.google.com`);
    console.error(`  2. Create or select a project`);
    console.error(`  3. Enable "Google Sheets API" and "Google Drive API"`);
    console.error(`  4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID`);
    console.error(`  5. Application type: "Desktop app"`);
    console.error(`  6. Download JSON and save as: scripts/google-credentials.json`);
    console.error(`  7. Re-run this script\n`);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3333/oauth2callback'
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  // Start local server to catch the callback
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:3333');
      if (url.pathname === '/oauth2callback') {
        const authCode = url.searchParams.get('code');
        if (authCode) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authorized! You can close this tab.</h1>');
          server.close();
          resolve(authCode);
        } else {
          res.writeHead(400);
          res.end('No code received');
          server.close();
          reject(new Error('No authorization code'));
        }
      }
    });

    server.listen(3333, () => {
      console.log(`\n🔐 Opening browser for Google authorization...`);
      console.log(`If it doesn't open, visit:\n${authUrl}\n`);
      // Try to open browser
      import('child_process').then(({ exec }) => {
        exec(`open "${authUrl}"`);
      });
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`\n✅ Token saved to ${TOKEN_PATH}`);
  console.log(`You're authenticated as your Google account. The skills can now access Sheets.\n`);
}

main().catch(console.error);
