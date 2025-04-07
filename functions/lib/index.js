"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentUpdated = exports.onAppointmentCreated = exports.api = void 0;
require("./config/firebase");
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./auth/middleware");
const api_1 = require("./client/api");
const api_2 = require("./appointment/api");
const service_1 = require("./calendar/service");
const google_1 = require("./config/google");
const settings_1 = require("./calendar/settings");
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
const appointment_1 = require("./triggers/appointment");
Object.defineProperty(exports, "onAppointmentCreated", { enumerable: true, get: function () { return appointment_1.onAppointmentCreated; } });
Object.defineProperty(exports, "onAppointmentUpdated", { enumerable: true, get: function () { return appointment_1.onAppointmentUpdated; } });
const service_2 = require("./tracking/service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Add debug middleware to log all requests
app.use((req, res, next) => {
    console.log('\n🔍 === INCOMING REQUEST ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    next();
});
// Client routes
app.post('/clients', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_1.createClient)(req, res);
});
app.get('/clients/:id', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_1.getClient)(req, res);
});
app.put('/clients/:id', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_1.updateClient)(req, res);
});
app.delete('/clients/:id', middleware_1.verifyAdmin, async (req, res) => {
    await (0, api_1.deleteClient)(req, res);
});
app.get('/clients', middleware_1.verifyAdmin, async (req, res) => {
    await (0, api_1.listClients)(req, res);
});
app.post('/clients/:id/statistics', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_1.updateClientStatistics)(req, res);
});
// Appointment routes
app.post('/appointments', middleware_1.verifyAuth, async (req, res) => {
    try {
        const appointment = await service_1.calendarService.createAppointment(req.body);
        res.json(appointment);
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});
app.get('/appointments/:id', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_2.getAppointment)(req, res);
});
app.put('/appointments/:id', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_2.updateAppointment)(req, res);
});
app.delete('/appointments/:id', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_2.deleteAppointment)(req, res);
});
app.get('/appointments', middleware_1.verifyAuth, async (req, res) => {
    await (0, api_2.listAppointments)(req, res);
});
// Get appointment status
app.get('/appointments/:id/status', middleware_1.verifyAuth, async (req, res) => {
    try {
        const status = await service_1.calendarService.getAppointmentStatus(req.params.id);
        res.json(status);
    }
    catch (error) {
        console.error('Error getting appointment status:', error);
        res.status(500).json({ error: 'Failed to get appointment status' });
    }
});
// Calendar routes
app.get('/calendar/connect', middleware_1.verifyAuth, middleware_1.verifyAdmin, async (req, res) => {
    const authUrl = google_1.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent' // Force consent screen to get refresh token
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
        }
        else {
            console.log('Using real Google OAuth');
            const response = await google_1.oauth2Client.getToken(code);
            tokens = response.tokens;
        }
        // Create settings document
        const settingsRef = admin.firestore().collection('settings').doc('calendar_oauth');
        // Use Timestamp directly
        const expiryTimestamp = firestore_1.Timestamp.fromMillis(tokens.expiry_date || Date.now() + 3600 * 1000);
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
    }
    catch (error) {
        console.error('Error connecting calendar:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to connect calendar' });
        }
    }
});
// Add a route to check calendar connection status
app.get('/calendar/status', middleware_1.verifyAuth, middleware_1.verifyAdmin, async (req, res) => {
    try {
        const oauthSettings = await (0, settings_1.getCalendarOAuthSettings)();
        await res.json({
            connected: !!oauthSettings,
            expiryDate: oauthSettings === null || oauthSettings === void 0 ? void 0 : oauthSettings.expiryDate
        });
    }
    catch (error) {
        console.error('Error checking calendar status:', error);
        await res.status(500).json({ error: 'Failed to check calendar status' });
    }
});
app.get('/calendar/available-slots', middleware_1.verifyAuth, async (req, res) => {
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
        const slots = await service_1.calendarService.getAvailability(new Date(startDate), new Date(endDate));
        res.json({ slots });
    }
    catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ error: 'Failed to get available slots' });
    }
});
// Tracking endpoints
app.get('/tracking/client/:clientId', middleware_1.verifyAuth, async (req, res) => {
    try {
        const trackingService = new service_2.TrackingService();
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
        const stats = await trackingService.getClientStats(clientId, new Date(startDate), new Date(endDate));
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting client stats:', error);
        res.status(500).json({ error: 'Failed to get client statistics' });
    }
});
app.get('/tracking/overall', middleware_1.verifyAuth, middleware_1.verifyAdmin, async (req, res) => {
    try {
        const trackingService = new service_2.TrackingService();
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            res.status(400).json({
                error: 'Missing required parameters',
                required: ['startDate', 'endDate'],
                format: 'YYYY-MM-DD'
            });
            return;
        }
        const stats = await trackingService.getOverallStats(new Date(startDate), new Date(endDate));
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting overall stats:', error);
        res.status(500).json({ error: 'Failed to get overall statistics' });
    }
});
// Export the functions
exports.api = functions.https.onRequest({ region: 'europe-west1' }, app);
//# sourceMappingURL=index.js.map