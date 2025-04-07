"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentDeleted = exports.onAppointmentUpdated = exports.onAppointmentCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const service_1 = require("../email/service");
const emailService = new service_1.EmailService();
exports.onAppointmentCreated = (0, firestore_1.onDocumentCreated)('appointments/{appointmentId}', async (event) => {
    var _a;
    const appointment = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!appointment)
        return;
    try {
        await emailService.sendAppointmentConfirmation(appointment);
    }
    catch (error) {
        console.error('Error sending appointment confirmation:', error);
    }
});
exports.onAppointmentUpdated = (0, firestore_1.onDocumentUpdated)('appointments/{appointmentId}', async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!beforeData || !afterData)
        return;
    try {
        await emailService.sendAppointmentReminder(afterData);
    }
    catch (error) {
        console.error('Error sending appointment reminder:', error);
    }
});
exports.onAppointmentDeleted = (0, firestore_1.onDocumentDeleted)('appointments/{appointmentId}', async (event) => {
    var _a;
    const appointment = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!appointment)
        return;
    try {
        await emailService.sendAppointmentFollowup(appointment);
    }
    catch (error) {
        console.error('Error sending appointment followup:', error);
    }
});
//# sourceMappingURL=triggers.js.map