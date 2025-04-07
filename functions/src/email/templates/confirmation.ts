import { Appointment } from '../../types/appointment';
import { emailStyles, formatDate, formatTime } from './styles';

export function generateConfirmationEmail(appointment: Appointment): string {
  const { date, description, attendees, title } = appointment;
  const [client] = attendees;

  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${emailStyles.logo}" />
        <h1>Afspraak Bevestiging</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Je afspraak is succesvol ingepland. Hier zijn de details:</p>
        
        <div style="${emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${formatDate(date.toDate())}</p>
          <p><strong>Tijd:</strong> ${formatTime(date.toDate())}</p>
          <p><strong>Beschrijving:</strong> ${description}</p>
        </div>

        <p>De afspraak is toegevoegd aan je Google Calendar. Je kunt deze daar accepteren of afwijzen.</p>
        
        <a href="https://calendar.google.com" style="${emailStyles.button}">
          Open in Google Calendar
        </a>
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