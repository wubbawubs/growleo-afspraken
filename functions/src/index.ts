import './config/firebase';
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { verifyAuth, verifyAdmin } from './auth/middleware';
import { createClient, getClient, updateClient, deleteClient, listClients, updateClientStatistics, getClientSettings, updateClientSettings } from './client/api';
import { createAppointment, getAppointment, updateAppointment, deleteAppointment, listAppointments } from './appointment/api';
import { calendarService } from './calendar/service';
import { oauth2Client } from './config/google';
import { saveCalendarSettings, getCalendarSettings, getCalendarOAuthSettings, saveCalendarOAuthSettings } from './calendar/settings';
import { Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { onAppointmentCreated, onAppointmentUpdated } from './triggers/appointment';
import { TrackingService } from './tracking/service';
import { getClientStatsCallable, getOverallStatsCallable, trackEventCallable } from './tracking/callable';

const app = express();
app.use(cors());
app.use(express.json());

// Add debug middleware to log all requests
app.use((req, res, next) => {
  console.log('\n🔍 === INCOMING REQUEST ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  next();
});

// Client routes
app.post('/clients', verifyAuth, async (req, res) => {
  await createClient(req, res);
});

app.get('/clients/:id', verifyAuth, async (req, res) => {
  await getClient(req, res);
});

app.put('/clients/:id', verifyAuth, async (req, res) => {
  await updateClient(req, res);
});

app.delete('/clients/:id', verifyAuth, async (req, res) => {
  await deleteClient(req, res);
});

app.get('/clients', verifyAuth, async (req, res) => {
  await listClients(req, res);
});

app.post('/clients/:clientId/statistics', verifyAuth, async (req, res) => {
  await updateClientStatistics(req, res);
});

app.get('/clients/:clientId/settings', verifyAuth, async (req, res) => {
  await getClientSettings(req, res);
});

app.put('/clients/:clientId/settings', verifyAuth, async (req, res) => {
  await updateClientSettings(req, res);
});

// Appointment routes
app.post('/appointments', verifyAuth, async (req, res) => {
  try {
    const appointment = await calendarService.createAppointment(req.body);
    res.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});
app.get('/appointments/:id', verifyAuth, async (req, res) => {
  await getAppointment(req, res);
});
app.put('/appointments/:id', verifyAuth, async (req, res) => {
  await updateAppointment(req, res);
});
app.delete('/appointments/:id', verifyAuth, async (req, res) => {
  await deleteAppointment(req, res);
});
app.get('/appointments', verifyAuth, async (req, res) => {
  await listAppointments(req, res);
});

// Get appointment status
app.get('/appointments/:id/status', verifyAuth, async (req, res) => {
  try {
    const status = await calendarService.getAppointmentStatus(req.params.id);
    res.json(status);
  } catch (error) {
    console.error('Error getting appointment status:', error);
    res.status(500).json({ error: 'Failed to get appointment status' });
  }
});

// Calendar routes
app.get('/calendar/connect', verifyAuth, verifyAdmin, async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent'  // Force consent screen to get refresh token
  });
  await res.json({ url: authUrl });
});

app.get('/calendar/callback', async (req, res) => {
  try {
    console.log('Current environment:', process.env.NODE_ENV);
    
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Invalid authorization code' });
      return;
    }

    const isTestMode = true; // Force test mode for now
    console.log('Is test mode:', isTestMode);

    let tokens;
    if (isTestMode) {
      console.log('Using mock tokens for test');
      tokens = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expiry_date: Date.now() + 3600 * 1000
      };
    } else {
      console.log('Using real Google OAuth');
      const response = await oauth2Client.getToken(code);
      tokens = response.tokens;
    }

    // Create settings document
    const settingsRef = admin.firestore().collection('settings').doc('calendar_oauth');
    
    // Use Timestamp directly
    const expiryTimestamp = Timestamp.fromMillis(tokens.expiry_date || Date.now() + 3600 * 1000);
    
    await settingsRef.set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: expiryTimestamp,
      calendarId: 'primary'
    }, { merge: true });

    // Initialize default calendar settings
    const calendarSettingsRef = admin.firestore().collection('settings').doc('calendar_settings');
    await calendarSettingsRef.set({
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      timezone: 'Europe/Amsterdam',
      defaultDuration: 60
    }, { merge: true });

    res.json({ message: 'Calendar connected successfully' });
  } catch (error) {
    console.error('Error connecting calendar:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to connect calendar' });
    }
  }
});

// Add a route to check calendar connection status
app.get('/calendar/status', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const oauthSettings = await getCalendarOAuthSettings();
    await res.json({ 
      connected: !!oauthSettings,
      expiryDate: oauthSettings?.expiryDate
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    await res.status(500).json({ error: 'Failed to check calendar status' });
  }
});

app.get('/calendar/available-slots', verifyAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['startDate', 'endDate'],
        format: 'YYYY-MM-DD'
      });
      return;
    }

    const slots = await calendarService.getAvailability(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ slots });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Tracking endpoints
app.get('/tracking/client/:clientId', verifyAuth, async (req, res) => {
  try {
    const trackingService = new TrackingService();
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['startDate', 'endDate'],
        format: 'YYYY-MM-DD'
      });
      return;
    }

    const stats = await trackingService.getClientStats(
      clientId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting client stats:', error);
    res.status(500).json({ error: 'Failed to get client statistics' });
  }
});

app.get('/tracking/overall', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const trackingService = new TrackingService();
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['startDate', 'endDate'],
        format: 'YYYY-MM-DD'
      });
      return;
    }

    const stats = await trackingService.getOverallStats(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting overall stats:', error);
    res.status(500).json({ error: 'Failed to get overall statistics' });
  }
});

// Export the functions
export const api = functions.https.onRequest({ region: 'europe-west1' }, app);
export { onAppointmentCreated, onAppointmentUpdated };
export { getClientStatsCallable, getOverallStatsCallable, trackEventCallable }; 