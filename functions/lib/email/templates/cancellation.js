"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCancellationEmail = generateCancellationEmail;
const styles_1 = require("./styles");
function generateCancellationEmail(appointment) {
    const { date, attendees, title } = appointment;
    const [client] = attendees;
    return `
    <div style="${styles_1.emailStyles.container}">
      <div style="${styles_1.emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${styles_1.emailStyles.logo}" />
        <h1>Afspraak Geannuleerd</h1>
      </div>
      
      <div style="${styles_1.emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Je afspraak is geannuleerd:</p>
        
        <div style="${styles_1.emailStyles.appointmentBox}">
          <p><strong>Titel:</strong> ${title}</p>
          <p><strong>Datum:</strong> ${(0, styles_1.formatDate)(date.toDate())}</p>
          <p><strong>Tijd:</strong> ${(0, styles_1.formatTime)(date.toDate())}</p>
        </div>

        <p>Wil je een nieuwe afspraak inplannen? Dat kan eenvoudig via onderstaande knop:</p>
        
        <a href="https://growleo.nl/afspraak-maken" style="${styles_1.emailStyles.button}">
          Nieuwe afspraak maken
        </a>
      </div>

      <div style="${styles_1.emailStyles.footer}">
        <p>Met vriendelijke groet,<br>Team Growleo</p>
        <p style="font-size: 12px; margin-top: 10px;">
          Vragen? Mail ons op <a href="mailto:support@growleo.nl">support@growleo.nl</a>
        </p>
      </div>
    </div>
  `;
}
//# sourceMappingURL=cancellation.js.map