import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { Appointment } from '../types/appointment';
import { EmailService } from '../email/service';

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
  const beforeData = event.data?.before.data() as Appointment;
  const afterData = event.data?.after.data() as Appointment;
  if (!beforeData || !afterData) return;

  try {
    await emailService.sendAppointmentReminder(afterData);
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
  }
});

export const onAppointmentDeleted = onDocumentDeleted('appointments/{appointmentId}', async (event) => {
  const appointment = event.data?.data() as Appointment;
  if (!appointment) return;

  try {
    await emailService.sendAppointmentFollowup(appointment);
  } catch (error) {
    console.error('Error sending appointment followup:', error);
  }
}); 