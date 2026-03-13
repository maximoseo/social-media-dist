import { google } from 'googleapis';
import type { CalendarEntry, SiteBundle } from './types';

function getGoogleSheetsClient() {
  const serviceAccountJson = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!serviceAccountJson || !spreadsheetId) {
    return null;
  }

  const credentials = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    spreadsheetId,
    sheets: google.sheets({ version: 'v4', auth }),
  };
}

export async function syncCalendarEntryToSheet(params: {
  site: SiteBundle;
  entry: CalendarEntry;
  articleTitle: string;
  variantBody: string;
  publishStatus: string;
}) {
  const client = getGoogleSheetsClient();
  if (!client) {
    return null;
  }

  const sheetName =
    process.env.GOOGLE_SHEETS_DEFAULT_SHEET || slugForSheet(params.site.site.name);

  const row = [
    params.entry.id,
    params.site.site.name,
    params.site.site.domain,
    params.entry.platform,
    params.articleTitle,
    params.variantBody,
    params.entry.scheduled_for,
    params.publishStatus,
    new Date().toISOString(),
  ];

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: `${sheetName}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });

  return {
    sheetName,
    row,
  };
}

function slugForSheet(value: string) {
  return value.replace(/[^\w]+/g, ' ').trim().slice(0, 90) || 'Content Calendar';
}
