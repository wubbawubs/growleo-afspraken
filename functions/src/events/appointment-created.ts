import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { EmailService } from '../email/service';
import { Appointment } from '../types/appointment';

const emailService = new EmailService();

export const onAppointmentCreated = onDocumentCreated('appointments/{appointmentId}', async (event) => {
  const appointment = event.data?.data() as Appointment;
  if (!appointment) return;

  try {
    await emailService.sendAppointmentConfirmation(appointment);
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
  }
});

export const onAppointmentUpdated = onDocumentUpdated('appointments/{appointmentId}', async (event) => {
  const afterData = event.data?.after.data() as Appointment;
  if (!afterData) return;
  
  if (afterData.status === 'cancelled') {
    try {
      await emailService.sendCancellationEmail(afterData);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }
  }
});