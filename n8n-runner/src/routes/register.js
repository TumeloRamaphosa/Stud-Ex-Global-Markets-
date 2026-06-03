import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

router.post('/api/register', async (req, res) => {
  const { name, email, phone, business, registeredAt, event } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email and phone are required' });
  }

  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const spreadsheetId = process.env.REGISTRATION_SHEET_ID;

    if (!serviceAccountJson || !spreadsheetId) {
      // Fallback: log to console if Google Sheets not configured
      console.log('REGISTRATION:', JSON.stringify({ name, email, phone, business, registeredAt, event }));
      return res.json({ success: true, stored: 'log' });
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, phone, business || '', registeredAt || new Date().toISOString(), event || 'Global Markets']],
      },
    });

    res.json({ success: true, stored: 'sheets' });
  } catch (err) {
    console.error('Registration sheet error:', err.message);
    // Still return success - we logged it above
    console.log('REGISTRATION_FALLBACK:', JSON.stringify({ name, email, phone, business, registeredAt, event }));
    res.json({ success: true, stored: 'log' });
  }
});

export const registerRouter = router;
