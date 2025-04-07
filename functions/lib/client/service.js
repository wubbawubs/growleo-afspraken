"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientService = exports.ClientService = void 0;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
class ClientService {
    constructor() {
        this.collection = db.collection('clients');
    }
    async createClient(input) {
        const client = Object.assign(Object.assign({ id: '' }, input), { statistics: {
                totalAppointments: 0,
                completedAppointments: 0,
                cancelledAppointments: 0,
                showUpRate: 0
            }, createdAt: new Date(), updatedAt: new Date() });
        const docRef = await this.collection.add(client);
        return Object.assign(Object.assign({}, client), { id: docRef.id });
    }
    async getClient(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists)
            return null;
        return Object.assign({ id: doc.id }, doc.data());
    }
    async updateClient(id, input) {
        const client = await this.getClient(id);
        if (!client)
            return null;
        const updateData = Object.assign(Object.assign({}, input), { updatedAt: new Date() });
        await this.collection.doc(id).update(updateData);
        return Object.assign(Object.assign({}, client), updateData);
    }
    async deleteClient(id) {
        const client = await this.getClient(id);
        if (!client)
            return false;
        await this.collection.doc(id).delete();
        return true;
    }
    async listClients() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    async updateClientStatistics(clientId) {
        const appointments = await db
            .collection('appointments')
            .where('clientId', '==', clientId)
            .get();
        const stats = {
            totalAppointments: appointments.size,
            completedAppointments: 0,
            cancelledAppointments: 0,
            showUpRate: 0
        };
        appointments.forEach(doc => {
            const appointment = doc.data();
            if (appointment.status === 'scheduled') {
                stats.completedAppointments++;
            }
            else if (appointment.status === 'cancelled') {
                stats.cancelledAppointments++;
            }
        });
        stats.showUpRate = stats.totalAppointments > 0
            ? (stats.completedAppointments / stats.totalAppointments) * 100
            : 0;
        await this.collection.doc(clientId).update({
            statistics: stats,
            updatedAt: new Date()
        });
    }
}
exports.ClientService = ClientService;
exports.clientService = new ClientService();
//# sourceMappingURL=service.js.map