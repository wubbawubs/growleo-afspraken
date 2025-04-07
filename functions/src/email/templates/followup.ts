import { Appointment } from '../../types/appointment';
import { emailStyles, formatDate } from './styles';

export function generateFollowupEmail(appointment: Appointment): string {
  const { date, attendees, title } = appointment;
  const [client] = attendees;

  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${emailStyles.logo}" />
        <h1>Bedankt voor je afspraak</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Bedankt voor je afspraak "${title}" op ${formatDate(date.toDate())}.</p>
        
        <p>We hopen dat de afspraak naar wens is verlopen. Je feedback is voor ons waardevol!</p>
        
        <a href="https://growleo.nl/feedback" style="${emailStyles.button}">
          Geef je feedback
        </a>

        <p>Wil je een nieuwe afspraak maken? Dat kan eenvoudig via onze website:</p>
        
        <a href="https://growleo.nl/afspraak-maken" style="${emailStyles.button}">
          Nieuwe afspraak maken
        </a>
      </div>

      <div style="${emailStyles.footer}">
        <p>Met vriendelijke groet,<br>Team Growleo</p>
        <p style="font-size: 12px; margin-top: 10px;">
          Vragen of opmerkingen? Mail ons op <a href="mailto:support@growleo.nl">support@growleo.nl</a>
        </p>
      </div>
    </div>
  `;
} 