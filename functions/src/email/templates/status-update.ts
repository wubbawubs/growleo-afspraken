import { Appointment } from '../../types/appointment';
import { emailStyles, formatDate, formatTime } from './styles';

export function generateStatusUpdateEmail(appointment: Appointment): string {
  const { title, description, startTime, endTime, status, attendees } = appointment;
  const [client] = attendees;

  const statusMessages = {
    confirmed: 'Your appointment has been confirmed.',
    cancelled: 'Your appointment has been cancelled.',
    completed: 'Your appointment has been marked as completed.',
    pending: 'Your appointment is pending confirmation.'
  };

  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${emailStyles.logo}" />
        <h1>Appointment Status Update</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>${statusMessages[status]}</p>
        
        <div style="${emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${formatDate(startTime.toDate())}</p>
          <p><strong>Tijd:</strong> ${formatTime(startTime.toDate())} - ${formatTime(endTime.toDate())}</p>
          <p><strong>Beschrijving:</strong> ${description}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>

        ${status === 'confirmed' ? `
          <p>De afspraak is toegevoegd aan je Google Calendar. Je kunt deze daar bekijken.</p>
          <a href="https://calendar.google.com" style="${emailStyles.button}">
            Open in Google Calendar
          </a>
        ` : ''}
      </div>

      <div style="${emailStyles.footer}">
        <p>Met vriendelijke groet,<br>Team Growleo</p>
        <p style="font-size: 12px; margin-top: 10px;">
          Heb je vragen? Mail ons op <a href="mailto:support@growleo.nl">support@growleo.nl</a>
        </p>
      </div>
    </div>
  `;
} 