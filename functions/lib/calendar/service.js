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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarService = exports.FirebaseCalendarService = void 0;
const firestore_1 = require("firebase-admin/firestore");
const calendar_1 = require("@googleapis/calendar");
const google_1 = require("../config/google");
const admin = __importStar(require("firebase-admin"));
const settings_1 = require("./settings");
const firestore_2 = require("firebase-admin/firestore");
const service_1 = require("../email/service");
class FirebaseCalendarService {
    constructor() {
        this.db = (0, firestore_1.getFirestore)();
        this.calendar = new calendar_1.calendar_v3.Calendar({ auth: google_1.oauth2Client });
        this.emailService = new service_1.EmailService();
    }
    async getEvents(startTime, endTime) {
        const events = await this.db
            .collection('calendar_events')
            .where('startTime', '>=', startTime)
            .where('endTime', '<=', endTime)
            .get();
        return events.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    async createEvent(event) {
        const docRef = await this.db.collection('calendar_events').add(event);
        return Object.assign({ id: docRef.id }, event);
    }
    async getEvent(id) {
        var _a, _b;
        const doc = await this.db.collection('calendar_events').doc(id).get();
        if (!doc.exists) {
            throw new Error('Event not found');
        }
        const data = doc.data();
        return {
            id: doc.id,
            appointmentId: data === null || data === void 0 ? void 0 : data.appointmentId,
            title: data === null || data === void 0 ? void 0 : data.title,
            description: data === null || data === void 0 ? void 0 : data.description,
            startTime: (_a = data === null || data === void 0 ? void 0 : data.startTime) === null || _a === void 0 ? void 0 : _a.toDate(),
            endTime: (_b = data === null || data === void 0 ? void 0 : data.endTime) === null || _b === void 0 ? void 0 : _b.toDate(),
            location: data === null || data === void 0 ? void 0 : data.location,
            attendees: data === null || data === void 0 ? void 0 : data.attendees,
            status: data === null || data === void 0 ? void 0 : data.status,
        };
    }
    async updateEvent(id, event) {
        await this.db.collection('calendar_events').doc(id).update(event);
        return this.getEvent(id);
    }
    async deleteEvent(eventId) {
        await this.db.collection('calendar_events').doc(eventId).delete();
    }
    async getAvailability(startTime, endTime) {
        var _a;
        try {
            // Get calendar settings
            const settings = await (0, settings_1.getCalendarSettings)() || {
                workingHours: { start: '09:00', end: '17:00' },
                timezone: 'Europe/Amsterdam',
                defaultDuration: 60
            };
            // Get OAuth settings
            const oauthSettings = await (0, settings_1.getCalendarOAuthSettings)();
            // Check if we're using mock credentials
            const isMockCredentials = (oauthSettings === null || oauthSettings === void 0 ? void 0 : oauthSettings.accessToken) === 'mock_access_token';
            console.log('Availability check:', {
                startTime,
                endTime,
                isMockCredentials,
                hasOAuthSettings: !!oauthSettings
            });
            // If using mock credentials, return test data
            if (isMockCredentials) {
                console.log('Using mock data for availability');
                const slots = [];
                let currentTime = new Date(startTime);
                while (currentTime < endTime) {
                    const hour = currentTime.getHours();
                    if (hour >= 9 && hour < 17) { // Working hours
                        slots.push({
                            startTime: new Date(currentTime),
                            endTime: new Date(currentTime.getTime() + settings.defaultDuration * 60000),
                            isAvailable: true
                        });
                    }
                    currentTime = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
                }
                return slots;
            }
            // Real implementation for production
            if (!oauthSettings) {
                throw new Error('Calendar not connected. Please connect Google Calendar first.');
            }
            google_1.oauth2Client.setCredentials({
                access_token: oauthSettings.accessToken,
                refresh_token: oauthSettings.refreshToken,
                expiry_date: oauthSettings.expiryDate.toDate().getTime()
            });
            const events = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });
            // Generate available slots
            const slots = [];
            let currentTime = new Date(startTime);
            while (currentTime < endTime) {
                const hour = currentTime.getHours();
                if (hour >= 9 && hour < 17) { // Working hours
                    const slotEnd = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
                    const isAvailable = !((_a = events.data.items) === null || _a === void 0 ? void 0 : _a.some(event => {
                        var _a, _b;
                        const eventStart = new Date(((_a = event.start) === null || _a === void 0 ? void 0 : _a.dateTime) || '');
                        const eventEnd = new Date(((_b = event.end) === null || _b === void 0 ? void 0 : _b.dateTime) || '');
                        return ((currentTime >= eventStart && currentTime < eventEnd) ||
                            (slotEnd > eventStart && slotEnd <= eventEnd));
                    }));
                    if (isAvailable) {
                        slots.push({
                            startTime: new Date(currentTime),
                            endTime: slotEnd,
                            isAvailable: true
                        });
                    }
                }
                currentTime = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
            }
            return slots;
        }
        catch (error) {
            console.error('Error in getAvailability:', error);
            throw error;
        }
    }
    async getSettings() {
        const settings = await (0, settings_1.getCalendarSettings)();
        if (!settings) {
            // Return default settings als er nog geen zijn opgeslagen
            return {
                workingHours: {
                    start: '09:00',
                    end: '17:00'
                },
                timezone: 'Europe/Amsterdam',
                defaultDuration: 60
            };
        }
        return settings;
    }
    async updateSettings(settings) {
        await this.db.collection('calendar_settings').doc('default').set(Object.assign(Object.assign({}, settings), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
        return this.getSettings();
    }
    async createEventGoogle(event) {
        try {
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: event.title,
                    description: event.description,
                    start: {
                        dateTime: event.startTime.toISOString(),
                        timeZone: 'Europe/Amsterdam',
                    },
                    end: {
                        dateTime: event.endTime.toISOString(),
                        timeZone: 'Europe/Amsterdam',
                    },
                    location: event.location,
                    attendees: event.attendees.map((email) => ({ email })),
                    status: event.status,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }
    async updateEventGoogle(eventId, event) {
        var _a;
        try {
            const response = await this.calendar.events.patch({
                calendarId: 'primary',
                eventId,
                requestBody: {
                    summary: event.title,
                    description: event.description,
                    start: event.startTime ? {
                        dateTime: event.startTime.toISOString(),
                        timeZone: 'Europe/Amsterdam',
                    } : undefined,
                    end: event.endTime ? {
                        dateTime: event.endTime.toISOString(),
                        timeZone: 'Europe/Amsterdam',
                    } : undefined,
                    location: event.location,
                    attendees: (_a = event.attendees) === null || _a === void 0 ? void 0 : _a.map(email => ({ email })),
                    status: event.status,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error updating calendar event:', error);
            throw error;
        }
    }
    async deleteEventGoogle(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId,
            });
        }
        catch (error) {
            console.error('Error deleting calendar event:', error);
            throw error;
        }
    }
    async getEventGoogle(eventId) {
        try {
            const response = await this.calendar.events.get({
                calendarId: 'primary',
                eventId,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting calendar event:', error);
            throw error;
        }
    }
    async listEventsGoogle(timeMin, timeMax) {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items || [];
        }
        catch (error) {
            console.error('Error listing calendar events:', error);
            throw error;
        }
    }
    async listEvents(startTime, endTime) {
        try {
            const eventsRef = this.db.collection('events');
            const q = eventsRef.where('startTime', '>=', startTime)
                .where('startTime', '<=', endTime)
                .orderBy('startTime', 'asc');
            const snapshot = await q.get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error listing events:', error);
            throw new Error('Failed to list events');
        }
    }
    async getClientCalendarSettings(clientId) {
        var _a;
        const doc = await this.db.collection('clients').doc(clientId).get();
        if (!doc.exists)
            return null;
        return ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.calendarSettings) || null;
    }
    async createAppointment(appointmentData) {
        try {
            const oauthSettings = await (0, settings_1.getCalendarOAuthSettings)();
            const isMockCredentials = (oauthSettings === null || oauthSettings === void 0 ? void 0 : oauthSettings.accessToken) === 'mock_access_token';
            if (isMockCredentials) {
                const mockEventId = `mock-event-${Date.now()}`;
                const newAppointment = Object.assign(Object.assign({}, appointmentData), { id: mockEventId, googleEventId: mockEventId, createdAt: firestore_2.Timestamp.now(), updatedAt: firestore_2.Timestamp.now() });
                await this.db.collection('appointments').doc(newAppointment.id).set(newAppointment);
                return newAppointment;
            }
            // Rest of the production code...
            throw new Error('Not implemented'); // Temporary return for non-mock case
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }
    async getAppointmentStatus(appointmentId) {
        var _a;
        try {
            // Get appointment from Firestore
            const appointmentDoc = await this.db.collection('appointments').doc(appointmentId).get();
            if (!appointmentDoc.exists) {
                throw new Error('Appointment not found');
            }
            const appointment = appointmentDoc.data();
            // Get OAuth settings
            const oauthSettings = await (0, settings_1.getCalendarOAuthSettings)();
            // Check if we're using mock credentials
            const isMockCredentials = (oauthSettings === null || oauthSettings === void 0 ? void 0 : oauthSettings.accessToken) === 'mock_access_token';
            console.log('Getting appointment status:', {
                appointmentId,
                isMockCredentials,
                hasOAuthSettings: !!oauthSettings
            });
            // If using mock credentials, return test data
            if (isMockCredentials) {
                console.log('Using mock data for appointment status');
                return Object.assign(Object.assign({}, appointment), { attendees: appointment.attendees.map(attendee => (Object.assign(Object.assign({}, attendee), { responseStatus: 'needsAction' // Default status for test
                     }))) });
            }
            // Production code...
            const clientSettings = await this.getClientCalendarSettings(appointment.clientId);
            if (!clientSettings) {
                throw new Error('Client calendar not connected');
            }
            google_1.oauth2Client.setCredentials({
                access_token: clientSettings.accessToken,
                refresh_token: clientSettings.refreshToken,
                expiry_date: clientSettings.expiryDate.toDate().getTime()
            });
            const event = await this.calendar.events.get({
                calendarId: clientSettings.calendarId,
                eventId: appointment.googleEventId
            });
            const updatedAttendees = ((_a = event.data.attendees) === null || _a === void 0 ? void 0 : _a.map(a => {
                var _a;
                return ({
                    email: a.email || '',
                    name: a.displayName || ((_a = a.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'Unknown',
                    responseStatus: (a.responseStatus || 'needsAction')
                });
            })) || [];
            const updatedAppointment = Object.assign(Object.assign({}, appointment), { attendees: updatedAttendees, updatedAt: firestore_2.Timestamp.now() });
            await this.db.collection('appointments').doc(appointmentId).update({
                attendees: updatedAttendees,
                updatedAt: firestore_2.Timestamp.now()
            });
            const oldStatus = appointment.attendees[0].responseStatus;
            const newStatus = updatedAppointment.attendees[0].responseStatus;
            const statusChanged = oldStatus !== newStatus;
            if (statusChanged) {
                await this.emailService.sendAppointmentFollowup(updatedAppointment);
            }
            return updatedAppointment;
        }
        catch (error) {
            console.error('Error getting appointment status:', error);
            throw error;
        }
    }
}
exports.FirebaseCalendarService = FirebaseCalendarService;
exports.calendarService = new FirebaseCalendarService();
//# sourceMappingURL=service.js.map