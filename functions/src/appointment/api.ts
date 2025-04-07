import { Request, Response } from 'express';
import { Appointment, AppointmentCreateInput, AppointmentUpdateInput } from '../types/appointment';
import { AppointmentService } from './types';
import { admin, db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

const appointmentService: AppointmentService = {
  async createAppointment(data: AppointmentCreateInput): Promise<Appointment> {
    try {
      const now = new Date();
      
      const appointmentData: Omit<Appointment, 'id'> = {
        clientId: data.clientId,
        prospectEmail: data.prospectEmail,
        date: Timestamp.fromDate(new Date(data.date)),
        title: data.title,
        description: data.description,
        attendees: data.attendees.map((attendee: { email: string; name?: string }) => ({
          email: attendee.email,
          name: attendee.name || attendee.email.split('@')[0],
          responseStatus: 'needsAction' as const
        })),
        status: 'scheduled',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('Saving appointment data:', appointmentData);
      const docRef = await db.collection('appointments').add(appointmentData);
      console.log('Appointment created with ID:', docRef.id);
      return { id: docRef.id, ...appointmentData };
    } catch (error) {
      console.error('Firestore error:', error);
      throw error;
    }
  },

  async getAppointment(id: string): Promise<Appointment> {
    const db = admin.firestore();
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      throw new Error('Appointment not found');
    }
    return { id: doc.id, ...doc.data() } as Appointment;
  },

  async updateAppointment(id: string, data: AppointmentUpdateInput): Promise<Appointment> {
    // Eerst de data voorbereiden zonder date conversie
    const baseUpdateData = {
      ...data,
      updatedAt: Timestamp.now()
    };

    // Dan de date apart behandelen
    const updateData: AppointmentUpdateInput = {
      ...baseUpdateData,
      // Laat de date als Date type, de service zal het converteren naar Timestamp
      date: data.date
    };

    return appointmentService.updateAppointment(id, updateData);
  },

  async deleteAppointment(id: string): Promise<void> {
    const db = admin.firestore();
    await db.collection('appointments').doc(id).delete();
  },

  async getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    const db = admin.firestore();
    const snapshot = await db.collection('appointments')
      .where('clientId', '==', clientId)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Appointment);
  },

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const db = admin.firestore();
    const snapshot = await db.collection('appointments')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Appointment);
  }
};

export async function createAppointment(req: Request, res: Response) {
  try {
    console.log('Creating appointment with data:', req.body);
    const input = req.body;
    const appointmentData: AppointmentCreateInput = {
      clientId: input.clientId,
      prospectEmail: input.prospectEmail,
      date: input.date,
      title: input.title,
      description: input.description,
      attendees: input.attendees.map((attendee: { email: string; name?: string }) => ({
        email: attendee.email,
        name: attendee.name || attendee.email.split('@')[0],
        responseStatus: 'needsAction' as const
      }))
    };
    console.log('Processed appointment data:', appointmentData);
    const appointment = await appointmentService.createAppointment(appointmentData);
    return res.status(201).json(appointment);
  } catch (error) {
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

export async function getAppointment(req: Request, res: Response) {
  try {
    const appointment = await appointmentService.getAppointment(req.params.id);
    return res.status(200).json(appointment);
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    console.error('Error getting appointment:', error);
    return res.status(500).json({ error: 'Failed to get appointment' });
  }
}

export async function updateAppointment(req: Request, res: Response) {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    return res.status(200).json(appointment);
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    console.error('Error updating appointment:', error);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    await appointmentService.deleteAppointment(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
}

export async function listAppointments(req: Request, res: Response) {
  try {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    
    const appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate);
    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error listing appointments:', error);
    return res.status(500).json({ error: 'Failed to list appointments' });
  }
}
