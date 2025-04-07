/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Calendar API endpoints
app.get('/api/calendar/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token } = req.query;
    if (!access_token) {
      res.status(401).json({ error: 'No access token provided' });
      return;
    }

    oauth2Client.setCredentials({ access_token: access_token as string });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.calendarList.list();
    res.json({ connected: true, calendars: response.data.items });
  } catch (error) {
    console.error('Error checking calendar connection:', error);
    res.status(500).json({ error: 'Failed to check calendar connection' });
  }
});

app.get('/api/calendar/connect', (req: Request, res: Response): void => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  });
  res.json({ url: authUrl });
});

app.get('/api/calendar/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400).json({ error: 'No code provided' });
      return;
    }

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    res.json({ 
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

app.get('/api/calendar/time-slots', async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token, date } = req.query;
    if (!access_token || !date) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    oauth2Client.setCredentials({ access_token: access_token as string });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startTime = new Date(date as string);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(date as string);
    endTime.setHours(17, 0, 0, 0);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Generate available time slots
    const busySlots = response.data.items || [];
    const availableSlots = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      const isBusy = busySlots.some(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
        const eventEnd = new Date(event.end?.dateTime || event.end?.date || '');
        return (slotStart >= eventStart && slotStart < eventEnd) ||
               (slotEnd > eventStart && slotEnd <= eventEnd);
      });

      if (!isBusy) {
        availableSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.json({ timeSlots: availableSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
