import { getFirestore } from 'firebase-admin/firestore';
import { Client, ClientCreateInput, ClientUpdateInput, ClientSettings, ClientStatistics } from '../types/client';
import { Appointment } from '../types/appointment';

const db = getFirestore();

export class ClientService {
  private collection = db.collection('clients');

  private async initializeClientCollections(clientId: string) {
    const batch = db.batch();
    
    // Initialize settings
    const defaultSettings: ClientSettings = {
      workingHours: {},
      timezone: 'Europe/Amsterdam',
      defaultDuration: 60,
      notificationPreferences: {
        email: true,
        sms: false,
        whatsapp: false
      },
      appointmentTypes: [{
        id: 'default',
        name: 'Standaard Afspraak',
        duration: 60,
      }]
    };
    
    batch.set(
      this.collection.doc(clientId).collection('settings').doc('default'),
      defaultSettings
    );

    // Initialize statistics
    const defaultStats: ClientStatistics = {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      showUpRate: 0,
      conversionRate: 0,
      averageResponseTime: 0,
      clientSatisfaction: 0
    };
    
    batch.set(
      this.collection.doc(clientId).collection('statistics').doc('current'),
      defaultStats
    );

    await batch.commit();
  }

  async createClient(input: ClientCreateInput): Promise<Client> {
    const client: Client = {
      id: '', // Will be set by Firestore
      ...input,
      settings: input.settings || {
        workingHours: {},
        timezone: 'Europe/Amsterdam',
        defaultDuration: 60
      },
      statistics: {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        showUpRate: 0
      },
      integrations: input.integrations || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await this.collection.add(client);
    const clientId = docRef.id;
    
    // Initialize sub-collections
    await this.initializeClientCollections(clientId);
    
    return { ...client, id: clientId };
  }

  async getClient(id: string): Promise<Client | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;

    // Get settings and statistics from sub-collections
    const [settingsDoc, statsDoc] = await Promise.all([
      this.collection.doc(id).collection('settings').doc('default').get(),
      this.collection.doc(id).collection('statistics').doc('current').get()
    ]);

    const clientData = doc.data();
    return {
      id: doc.id,
      ...clientData,
      settings: settingsDoc.exists ? settingsDoc.data() : clientData.settings,
      statistics: statsDoc.exists ? statsDoc.data() : clientData.statistics
    } as Client;
  }

  async updateClient(id: string, input: ClientUpdateInput): Promise<Client | null> {
    const client = await this.getClient(id);
    if (!client) return null;

    const batch = db.batch();
    const clientRef = this.collection.doc(id);

    const updateData = {
      ...input,
      updatedAt: new Date()
    };

    // Update main document
    batch.update(clientRef, updateData);

    // Update settings if provided
    if (input.settings) {
      batch.update(
        clientRef.collection('settings').doc('default'),
        input.settings
      );
    }

    await batch.commit();
    return this.getClient(id);
  }

  async deleteClient(id: string): Promise<boolean> {
    const client = await this.getClient(id);
    if (!client) return false;

    const batch = db.batch();
    const clientRef = this.collection.doc(id);

    // Delete sub-collections
    const collections = ['settings', 'statistics', 'appointments', 'activities'];
    await Promise.all(
      collections.map(async (collectionName) => {
        const snapshot = await clientRef.collection(collectionName).get();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      })
    );

    // Delete main document
    batch.delete(clientRef);
    await batch.commit();

    return true;
  }

  async listClients(): Promise<Client[]> {
    const snapshot = await this.collection.get();
    const clients = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const client = await this.getClient(doc.id);
        return client;
      })
    );
    return clients.filter((client): client is Client => client !== null);
  }

  async updateClientStatistics(clientId: string): Promise<void> {
    const appointments = await db
      .collection('appointments')
      .where('clientId', '==', clientId)
      .get();

    const stats: ClientStatistics = {
      totalAppointments: appointments.size,
      completedAppointments: 0,
      cancelledAppointments: 0,
      showUpRate: 0,
      averageResponseTime: 0,
      conversionRate: 0,
      clientSatisfaction: 0
    };

    appointments.forEach(doc => {
      const appointment = doc.data() as Appointment;
      if (appointment.status === 'completed') {
        stats.completedAppointments++;
      } else if (appointment.status === 'cancelled') {
        stats.cancelledAppointments++;
      }
    });

    stats.showUpRate = stats.totalAppointments > 0
      ? (stats.completedAppointments / stats.totalAppointments) * 100
      : 0;

    // Update both main document and statistics sub-collection
    const batch = db.batch();
    const clientRef = this.collection.doc(clientId);
    
    batch.update(clientRef, {
      statistics: stats,
      updatedAt: new Date()
    });

    batch.set(
      clientRef.collection('statistics').doc('current'),
      stats
    );

    await batch.commit();
  }
}

export const clientService = new ClientService(); 