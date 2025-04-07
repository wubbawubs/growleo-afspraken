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
exports.EmailService = void 0;
const admin = __importStar(require("firebase-admin"));
const confirmation_1 = require("./templates/confirmation");
const reminder_1 = require("./templates/reminder");
const followup_1 = require("./templates/followup");
const cancellation_1 = require("./templates/cancellation");
class EmailService {
    async sendEmail(to, subject, html) {
        try {
            await admin.firestore().collection('mail').add({
                to,
                subject,
                html,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
    async sendAppointmentConfirmation(appointment) {
        const emailContent = (0, confirmation_1.generateConfirmationEmail)(appointment);
        await this.sendEmail(appointment.prospectEmail, 'Appointment Confirmation', emailContent);
    }
    async sendAppointmentReminder(appointment) {
        const emailContent = (0, reminder_1.generateReminderEmail)(appointment);
        await this.sendEmail(appointment.prospectEmail, 'Appointment Reminder', emailContent);
    }
    async sendAppointmentFollowup(appointment) {
        const emailContent = (0, followup_1.generateFollowupEmail)(appointment);
        await this.sendEmail(appointment.prospectEmail, 'Appointment Follow-up', emailContent);
    }
    async sendCancellationEmail(appointment) {
        const emailContent = (0, cancellation_1.generateCancellationEmail)(appointment);
        await this.sendEmail(appointment.prospectEmail, 'Afspraak Geannuleerd', emailContent);
        // Log voor tracking
        await admin.firestore().collection('email_logs').add({
            appointmentId: appointment.id,
            type: 'cancellation',
            status: 'sent',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=service.js.map