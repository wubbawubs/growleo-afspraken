import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import functionsTest = require('firebase-functions-test');
import { EmailService } from '../src/email/service';
import { Appointment } from '../src/types/appointment';
import { Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as functions from 'firebase-functions';
import * as express from 'express';

const testEnv = functionsTest();

describe('Email Service', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  const mockAppointment: Appointment = {
    id: 'test-id',
    clientId: 'test-client',
    prospectEmail: 'test@example.com',
    date: Timestamp.fromDate(new Date()),
    title: 'Test Afspraak',
    description: 'Test Beschrijving',
    status: 'scheduled',
    attendees: [{
      email: 'test@example.com',
      name: 'Test Klant',
      responseStatus: 'accepted'
    }],
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  };

  afterEach(() => {
    testEnv.cleanup();
    jest.clearAllMocks();
  });

  describe('Email Generation', () => {
    it('should generate confirmation email with correct content', async () => {
      const spy = jest.spyOn(emailService as any, 'sendEmail');
      await emailService.sendAppointmentConfirmation(mockAppointment);
      expect(spy).toHaveBeenCalledWith(
        mockAppointment.prospectEmail,
        'Appointment Confirmation',
        expect.stringContaining('Afspraak Bevestiging')
      );
    });

    it('should generate reminder email with correct content', () => {
      const spy = jest.spyOn(emailService as any, 'sendEmail');
      
      emailService.sendAppointmentReminder(mockAppointment);
      
      expect(spy).toHaveBeenCalledWith(
        mockAppointment.prospectEmail,
        'Appointment Reminder',
        expect.stringContaining('Herinnering')
      );
    });

    it('should generate followup email with correct content', () => {
      const spy = jest.spyOn(emailService as any, 'sendEmail');
      
      emailService.sendAppointmentFollowup(mockAppointment);
      
      expect(spy).toHaveBeenCalledWith(
        mockAppointment.prospectEmail,
        'Appointment Follow-up',
        expect.stringContaining('Bedankt')
      );
    });

    it('should generate cancellation email with correct content', () => {
      const spy = jest.spyOn(emailService as any, 'sendEmail');
      
      emailService.sendCancellationEmail(mockAppointment);
      
      expect(spy).toHaveBeenCalledWith(
        mockAppointment.prospectEmail,
        'Afspraak Geannuleerd',
        expect.stringContaining('Geannuleerd')
      );
    });
  });

  describe('Email Triggers', () => {
    it('should trigger confirmation email on appointment creation', async () => {
      // Spy op de globale emailService instance
      const spy = jest.spyOn(EmailService.prototype, 'sendAppointmentConfirmation');
      
      console.log('Creating test document...');
      
      const docRef = admin.firestore().collection('appointments').doc();
      await docRef.set({
        ...mockAppointment,
        id: docRef.id
      });

      console.log('Document created, waiting for trigger...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Spy calls:', spy.mock.calls);
      
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        id: docRef.id
      }));
    });

    it('should trigger cancellation email on appointment cancellation', async () => {
      const spy = jest.spyOn(EmailService.prototype, 'sendCancellationEmail');
      
      // Maak een test document
      const docRef = admin.firestore().collection('appointments').doc();
      await docRef.set({
        ...mockAppointment,
        id: docRef.id
      });

      // Update naar cancelled
      await docRef.update({ 
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });

      // Wacht even voor de trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        id: docRef.id,
        status: 'cancelled'
      }));
    });
  });
});

const emailService = new EmailService();

export const onAppointmentCreated = onDocumentCreated('appointments/{appointmentId}', async (event) => {
  console.log('Appointment created trigger fired');
  const appointment = event.data?.data() as Appointment;
  if (appointment) {
    await emailService.sendAppointmentConfirmation(appointment);
  }
});

export const onAppointmentUpdated = onDocumentUpdated('appointments/{appointmentId}', async (event) => {
  console.log('Appointment updated trigger fired');
  const afterData = event.data?.after.data() as Appointment;
  if (afterData?.status === 'cancelled') {
    await emailService.sendCancellationEmail(afterData);
  }
});

const app = express();

export const api = functions.https.onRequest({ region: 'europe-west1' }, app); 