"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCalendarOAuthSettings = saveCalendarOAuthSettings;
exports.getCalendarOAuthSettings = getCalendarOAuthSettings;
exports.updateCalendarToken = updateCalendarToken;
exports.saveCalendarSettings = saveCalendarSettings;
exports.getCalendarSettings = getCalendarSettings;
const firebase_1 = require("../config/firebase");
const OAUTH_SETTINGS_DOC_ID = 'calendar_oauth';
const CALENDAR_SETTINGS_DOC_ID = 'calendar_settings';
async function saveCalendarOAuthSettings(settings) {
    await firebase_1.db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).set(settings);
}
async function getCalendarOAuthSettings() {
    const doc = await firebase_1.db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).get();
    if (!doc.exists)
        return null;
    return doc.data();
}
async function updateCalendarToken(accessToken, expiryDate) {
    await firebase_1.db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).update({
        accessToken,
        expiryDate
    });
}
async function saveCalendarSettings(settings) {
    await firebase_1.db.collection('settings').doc(CALENDAR_SETTINGS_DOC_ID).set(settings);
}
async function getCalendarSettings() {
    const doc = await firebase_1.db.collection('settings').doc(CALENDAR_SETTINGS_DOC_ID).get();
    if (!doc.exists)
        return null;
    return doc.data();
}
//# sourceMappingURL=settings.js.map