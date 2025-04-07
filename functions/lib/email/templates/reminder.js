"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReminderEmail = generateReminderEmail;
const styles_1 = require("./styles");
function generateReminderEmail(appointment) {
    const { date, description, attendees, title } = appointment;
    const [client] = attendees;
    return `
    <div style="${styles_1.emailStyles.container}">
      <div style="${styles_1.emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${styles_1.emailStyles.logo}" />
        <h1>Herinnering: Je afspraak morgen</h1>
      </div>
      
      <div style="${styles_1.emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Dit is een herinnering voor je afspraak van morgen:</p>
        
        <div style="${styles_1.emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${(0, styles_1.formatDate)(date.toDate())}</p>
          <p><strong>Tijd:</strong> ${(0, styles_1.formatTime)(date.toDate())}</p>
          <p><strong>Beschrijving:</strong> ${description}</p>
        </div>

        <p>De afspraak staat in je Google Calendar. Je kunt deze openen via onderstaande knop:</p>
        
        <a href="https://calendar.google.com" style="${styles_1.emailStyles.button}">
          Open in Google Calendar
        </a>

        <p>Tot morgen!</p>
      </div>

      <div style="${styles_1.emailStyles.footer}">
        <p>Met vriendelijke groet,<br>Team Growleo</p>
        <p style="font-size: 12px; margin-top: 10px;">
          Moet je de afspraak verzetten? Mail ons op <a href="mailto:support@growleo.nl">support@growleo.nl</a>
        </p>
      </div>
    </div>
  `;
}
//# sourceMappingURL=reminder.js.map