"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientName = exports.formatTime = exports.formatDate = exports.emailStyles = void 0;
exports.emailStyles = {
    container: `
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `,
    header: `
    background-color: #2563eb;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  `,
    content: `
    padding: 20px;
    line-height: 1.6;
  `,
    appointmentBox: `
    background-color: #f3f4f6;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
    border-left: 4px solid #2563eb;
  `,
    button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    margin: 15px 0;
  `,
    footer: `
    text-align: center;
    padding: 20px;
    color: #6b7280;
    font-size: 14px;
    border-top: 1px solid #e5e7eb;
    margin-top: 20px;
  `,
    logo: `
    width: 120px;
    height: auto;
    margin-bottom: 15px;
  `
};
const formatDate = (date) => {
    return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
exports.formatDate = formatDate;
const formatTime = (date) => {
    return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.formatTime = formatTime;
const getClientName = (client) => {
    return client.name || client.email;
};
exports.getClientName = getClientName;
//# sourceMappingURL=styles.js.map