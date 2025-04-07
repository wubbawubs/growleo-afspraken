import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { Appointment } from '../types/appointment';
import { EmailService } from '../email/service';

const emailService = new EmailService();

export const onAppointmentCreated = onDocumentCreated('appointments/{appointmentId}', async (event) => {
  console.log('Appointment created trigger fired');
  const appointment = event.data?.data() as Appointment;
  if (!appointment) {
    console.log('No appointment data found');
    return;
  }

  try {
    console.log('Sending confirmation email for appointment:', appointment.id);
    await emailService.sendAppointmentConfirmation(appointment);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
  }
});

export const onAppointmentUpdated = onDocumentUpdated('appointments/{appointmentId}', async (event) => {
  console.log('Appointment updated trigger fired');
  const afterData = event.data?.after.data() as Appointment;
  const beforeData = event.data?.before.data() as Appointment;
  
  if (!afterData || !beforeData) {
    console.log('No appointment data found');
    return;
  }
  
  if (afterData.status === 'cancelled' && beforeData.status !== 'cancelled') {
    try {
      console.log('Sending cancellation email for appointment:', afterData.id);
      await emailService.sendCancellationEmail(afterData);
      console.log('Cancellation email sent successfully');
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }
  }
});