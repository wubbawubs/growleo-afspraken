import { Appointment } from '../../types/appointment';
import { emailStyles, formatDate, formatTime } from './styles';

export function generateReminderEmail(appointment: Appointment): string {
  const { title, description, startTime, endTime, attendees } = appointment;
  const [client] = attendees;

  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${emailStyles.logo}" />
        <h1>Appointment Reminder</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Dit is een herinnering voor je aankomende afspraak:</p>
        
        <div style="${emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${formatDate(startTime.toDate())}</p>
          <p><strong>Tijd:</strong> ${formatTime(startTime.toDate())} - ${formatTime(endTime.toDate())}</p>
          <p><strong>Beschrijving:</strong> ${description}</p>
        </div>

        <p>De afspraak staat in je Google Calendar. Je kunt deze daar bekijken of aanpassen.</p>
        
        <a href="https://calendar.google.com" style="${emailStyles.button}">
          Open in Google Calendar
        </a>

        <p style="margin-top: 20px; color: #666;">
          Als je de afspraak wilt wijzigen of annuleren, neem dan contact met ons op.
        </p>
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