"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFollowupEmail = generateFollowupEmail;
const styles_1 = require("./styles");
function generateFollowupEmail(appointment) {
    const { date, attendees, title } = appointment;
    const [client] = attendees;
    return `
    <div style="${styles_1.emailStyles.container}">
      <div style="${styles_1.emailStyles.header}">
        <img src="https://growleo.nl/logo.png" alt="Growleo" style="${styles_1.emailStyles.logo}" />
        <h1>Bedankt voor je afspraak</h1>
      </div>
      
      <div style="${styles_1.emailStyles.content}">
        <p>Beste ${client.name},</p>
        
        <p>Bedankt voor je afspraak "${title}" op ${(0, styles_1.formatDate)(date.toDate())}.</p>
        
        <p>We hopen dat de afspraak naar wens is verlopen. Je feedback is voor ons waardevol!</p>
        
        <a href="https://growleo.nl/feedback" style="${styles_1.emailStyles.button}">
          Geef je feedback
        </a>

        <p>Wil je een nieuwe afspraak maken? Dat kan eenvoudig via onze website:</p>
        
        <a href="https://growleo.nl/afspraak-maken" style="${styles_1.emailStyles.button}">
          Nieuwe afspraak maken
        </a>
      </div>

      <div style="${styles_1.emailStyles.footer}">
        <p>Met vriendelijke groet,<br>Team Growleo</p>
        <p style="font-size: 12px; margin-top: 10px;">
          Vragen of opmerkingen? Mail ons op <a href="mailto:support@growleo.nl">support@growleo.nl</a>
        </p>
      </div>
    </div>
  `;
}
//# sourceMappingURL=followup.js.map