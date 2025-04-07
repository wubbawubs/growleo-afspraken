"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentUpdated = exports.onAppointmentCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const service_1 = require("../email/service");
const emailService = new service_1.EmailService();
exports.onAppointmentCreated = (0, firestore_1.onDocumentCreated)('appointments/{appointmentId}', async (event) => {
    var _a;
    console.log('Appointment created trigger fired');
    const appointment = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!appointment) {
        console.log('No appointment data found');
        return;
    }
    try {
        console.log('Sending confirmation email for appointment:', appointment.id);
        await emailService.sendAppointmentConfirmation(appointment);
        console.log('Confirmation email sent successfully');
    }
    catch (error) {
        console.error('Error sending appointment confirmation:', error);
    }
});
exports.onAppointmentUpdated = (0, firestore_1.onDocumentUpdated)('appointments/{appointmentId}', async (event) => {
    var _a, _b;
    console.log('Appointment updated trigger fired');
    const afterData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    const beforeData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.before.data();
    if (!afterData || !beforeData) {
        console.log('No appointment data found');
        return;
    }
    if (afterData.status === 'cancelled' && beforeData.status !== 'cancelled') {
        try {
            console.log('Sending cancellation email for appointment:', afterData.id);
            await emailService.sendCancellationEmail(afterData);
            console.log('Cancellation email sent successfully');
        }
        catch (error) {
            console.error('Error sending cancellation email:', error);
        }
    }
});
//# sourceMappingURL=appointment.js.map