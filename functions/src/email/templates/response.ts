import { Appointment } from '../../types/appointment';
import { emailStyles, formatDate, formatTime } from './styles';

interface ResponseTemplate {
  subject: string;
  title: string;
  message: string;
  callToAction?: string;
  callToActionUrl?: string;
}

const responseTemplates: Record<string, ResponseTemplate> = {
  accepted: {
    subject: 'Looking forward to our meeting!',
    title: 'Meeting Confirmed',
    message: 'We\'re looking forward to meeting you! Your appointment has been confirmed.',
    callToAction: 'View in Calendar',
    callToActionUrl: 'https://calendar.google.com'
  },
  pending: {
    subject: 'Please confirm your attendance',
    title: 'Action Required: Confirm Your Meeting',
    message: 'Please confirm your attendance for the upcoming meeting.',
    callToAction: 'Confirm Meeting',
    callToActionUrl: 'https://calendar.google.com'
  },
  declined: {
    subject: 'Thank you for your response',
    title: 'Meeting Declined',
    message: 'Thank you for letting us know that you cannot attend the meeting.',
    callToAction: 'Schedule New Meeting',
    callToActionUrl: 'https://growleo.nl/afspraak-maken'
  }
};

export function generateResponseEmail(appointment: Appointment, responseStatus: string): string {
  const { title, description, startTime, endTime, attendees } = appointment;
  const [client] = attendees;
  const template = responseTemplates[responseStatus] || responseTemplates.pending;

  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${emailStyles.logo}" />
        <h1>${template.title}</h1>
      </div>
      
      <div style="${emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>${template.message}</p>
        
        <div style="${emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${formatDate(startTime.toDate())}</p>
          <p><strong>Tijd:</strong> ${formatTime(startTime.toDate())} - ${formatTime(endTime.toDate())}</p>
          <p><strong>Beschrijving:</strong> ${description}</p>
        </div>

        ${template.callToAction ? `
          <a href="${template.callToActionUrl}" style="${emailStyles.button}">
            ${template.callToAction}
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