"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const firestore_1 = require("firebase-admin/firestore");
class TrackingService {
    constructor() {
        this.db = (0, firestore_1.getFirestore)();
    }
    async trackEvent(event) {
        await this.db.collection('tracking_events').add(Object.assign(Object.assign({}, event), { timestamp: new Date() }));
    }
    async getClientStats(clientId, startDate, endDate) {
        const appointmentsSnapshot = await this.db
            .collection('appointments')
            .where('clientId', '==', clientId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();
        const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
        const total = appointments.length;
        const accepted = appointments.filter(a => a.status === 'accepted').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const stats = {
            totalAppointments: total,
            acceptedAppointments: accepted,
            cancelledAppointments: cancelled,
            pendingAppointments: pending,
            acceptanceRate: total ? (accepted / total) * 100 : 0,
            cancellationRate: total ? (cancelled / total) * 100 : 0,
            pendingRate: total ? (pending / total) * 100 : 0
        };
        return stats;
    }
    async getOverallStats(startDate, endDate) {
        const clientsSnapshot = await this.db.collection('clients').get();
        const stats = await Promise.all(clientsSnapshot.docs.map(doc => this.getClientStats(doc.id, startDate, endDate)));
        const totalClients = clientsSnapshot.size;
        const totalAppointments = stats.reduce((acc, curr) => acc + curr.totalAppointments, 0);
        const totalAccepted = stats.reduce((acc, curr) => acc + curr.acceptedAppointments, 0);
        const totalCancelled = stats.reduce((acc, curr) => acc + curr.cancelledAppointments, 0);
        const totalPending = stats.reduce((acc, curr) => acc + curr.pendingAppointments, 0);
        return {
            totalClients,
            totalAppointments,
            totalAccepted,
            totalCancelled,
            totalPending,
            overallAcceptanceRate: totalAppointments ? (totalAccepted / totalAppointments) * 100 : 0,
            overallCancellationRate: totalAppointments ? (totalCancelled / totalAppointments) * 100 : 0,
            overallPendingRate: totalAppointments ? (totalPending / totalAppointments) * 100 : 0
        };
    }
}
exports.TrackingService = TrackingService;
//# sourceMappingURL=service.js.map