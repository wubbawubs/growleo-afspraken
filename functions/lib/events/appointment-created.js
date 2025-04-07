"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentUpdated = exports.onAppointmentCreated = void 0;
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
    var _a;
    const afterData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    if (!afterData)
        return;
    if (afterData.status === 'cancelled') {
        try {
            await emailService.sendCancellationEmail(afterData);
        }
        catch (error) {
            console.error('Error sending cancellation email:', error);
        }
    }
});
//# sourceMappingURL=appointment-created.js.map