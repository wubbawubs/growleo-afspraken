"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCalendarEventDeleted = exports.onCalendarEventUpdated = exports.onCalendarEventCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
exports.onCalendarEventCreated = (0, firestore_1.onDocumentCreated)('calendar_events/{eventId}', async (event) => {
    var _a;
    const eventData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!eventData)
        return;
    const calendarEvent = Object.assign({ id: event.params.eventId }, eventData);
    // Handle calendar event creation
    console.log('Calendar event created:', calendarEvent.id);
});
exports.onCalendarEventUpdated = (0, firestore_1.onDocumentUpdated)('calendar_events/{eventId}', async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!beforeData || !afterData)
        return;
    const calendarEvent = Object.assign({ id: event.params.eventId }, afterData);
    // Handle calendar event update
    console.log('Calendar event updated:', calendarEvent.id);
});
exports.onCalendarEventDeleted = (0, firestore_1.onDocumentDeleted)('calendar_events/{eventId}', async (event) => {
    var _a;
    const eventData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!eventData)
        return;
    const calendarEvent = Object.assign({ id: event.params.eventId }, eventData);
    // Handle calendar event deletion
    console.log('Calendar event deleted:', calendarEvent.id);
});
//# sourceMappingURL=triggers.js.map