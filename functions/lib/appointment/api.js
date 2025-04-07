"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.getAppointment = getAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.listAppointments = listAppointments;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const appointmentService = {
    async createAppointment(data) {
        try {
            const now = new Date();
            const appointmentData = {
                clientId: data.clientId,
                prospectEmail: data.prospectEmail,
                date: firestore_1.Timestamp.fromDate(new Date(data.date)),
                title: data.title,
                description: data.description,
                attendees: data.attendees.map((attendee) => ({
                    email: attendee.email,
                    name: attendee.name || attendee.email.split('@')[0],
                    responseStatus: 'needsAction'
                })),
                status: 'scheduled',
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now()
            };
            console.log('Saving appointment data:', appointmentData);
            const docRef = await firebase_1.db.collection('appointments').add(appointmentData);
            console.log('Appointment created with ID:', docRef.id);
            return Object.assign({ id: docRef.id }, appointmentData);
        }
        catch (error) {
            console.error('Firestore error:', error);
            throw error;
        }
    },
    async getAppointment(id) {
        const db = firebase_1.admin.firestore();
        const doc = await db.collection('appointments').doc(id).get();
        if (!doc.exists) {
            throw new Error('Appointment not found');
        }
        return Object.assign({ id: doc.id }, doc.data());
    },
    async updateAppointment(id, data) {
        // Eerst de data voorbereiden zonder date conversie
        const baseUpdateData = Object.assign(Object.assign({}, data), { updatedAt: firestore_1.Timestamp.now() });
        // Dan de date apart behandelen
        const updateData = Object.assign(Object.assign({}, baseUpdateData), { 
            // Laat de date als Date type, de service zal het converteren naar Timestamp
            date: data.date });
        return appointmentService.updateAppointment(id, updateData);
    },
    async deleteAppointment(id) {
        const db = firebase_1.admin.firestore();
        await db.collection('appointments').doc(id).delete();
    },
    async getAppointmentsByClient(clientId) {
        const db = firebase_1.admin.firestore();
        const snapshot = await db.collection('appointments')
            .where('clientId', '==', clientId)
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
    async getAppointmentsByDateRange(startDate, endDate) {
        const db = firebase_1.admin.firestore();
        const snapshot = await db.collection('appointments')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'asc')
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
};
async function createAppointment(req, res) {
    try {
        console.log('Creating appointment with data:', req.body);
        const input = req.body;
        const appointmentData = {
            clientId: input.clientId,
            prospectEmail: input.prospectEmail,
            date: input.date,
            title: input.title,
            description: input.description,
            attendees: input.attendees.map((attendee) => ({
                email: attendee.email,
                name: attendee.name || attendee.email.split('@')[0],
                responseStatus: 'needsAction'
            }))
        };
        console.log('Processed appointment data:', appointmentData);
        const appointment = await appointmentService.createAppointment(appointmentData);
        return res.status(201).json(appointment);
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        if (error instanceof Error) {
            return res.status(500).json({
                error: 'Failed to create appointment',
                message: error.message,
                stack: error.stack
            });
        }
        return res.status(500).json({ error: 'Failed to create appointment' });
    }
}
async function getAppointment(req, res) {
    try {
        const appointment = await appointmentService.getAppointment(req.params.id);
        return res.status(200).json(appointment);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'Appointment not found') {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        console.error('Error getting appointment:', error);
        return res.status(500).json({ error: 'Failed to get appointment' });
    }
}
async function updateAppointment(req, res) {
    try {
        const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
        return res.status(200).json(appointment);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'Appointment not found') {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        console.error('Error updating appointment:', error);
        return res.status(500).json({ error: 'Failed to update appointment' });
    }
}
async function deleteAppointment(req, res) {
    try {
        await appointmentService.deleteAppointment(req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting appointment:', error);
        return res.status(500).json({ error: 'Failed to delete appointment' });
    }
}
async function listAppointments(req, res) {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        const appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate);
        return res.status(200).json(appointments);
    }
    catch (error) {
        console.error('Error listing appointments:', error);
        return res.status(500).json({ error: 'Failed to list appointments' });
    }
}
//# sourceMappingURL=api.js.map