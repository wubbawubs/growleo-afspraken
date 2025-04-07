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
exports.FirebaseAppointmentService = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
class FirebaseAppointmentService {
    constructor() {
        this.db = admin.firestore();
    }
    async createAppointment(data) {
        try {
            const appointmentData = Object.assign(Object.assign({}, data), { attendees: data.attendees.map(attendee => (Object.assign(Object.assign({}, attendee), { name: attendee.name || attendee.email.split('@')[0], responseStatus: 'needsAction' }))), status: 'scheduled', date: firestore_1.Timestamp.fromDate(new Date(data.date)), createdAt: firestore_1.Timestamp.now(), updatedAt: firestore_1.Timestamp.now() });
            const docRef = await this.db.collection('appointments').add(appointmentData);
            return Object.assign({ id: docRef.id }, appointmentData);
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }
    async getAppointment(id) {
        const doc = await this.db.collection('appointments').doc(id).get();
        if (!doc.exists) {
            throw new Error('Appointment not found');
        }
        return Object.assign({ id: doc.id }, doc.data());
    }
    async updateAppointment(id, data) {
        await this.db.collection('appointments').doc(id).update(Object.assign(Object.assign({}, data), { updatedAt: firestore_1.Timestamp.now() }));
        return this.getAppointment(id);
    }
    async deleteAppointment(id) {
        await this.db.collection('appointments').doc(id).delete();
    }
    async getAppointmentsByClient(clientId) {
        const snapshot = await this.db
            .collection('appointments')
            .where('clientId', '==', clientId)
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    async getAppointmentsByDateRange(startDate, endDate) {
        const snapshot = await this.db
            .collection('appointments')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'asc')
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
}
exports.FirebaseAppointmentService = FirebaseAppointmentService;
//# sourceMappingURL=service.js.map