import { db } from '../config/firebase';
import { CalendarOAuthSettings, CalendarSettings } from '../types/calendar';

const OAUTH_SETTINGS_DOC_ID = 'calendar_oauth';
const CALENDAR_SETTINGS_DOC_ID = 'calendar_settings';

export async function saveCalendarOAuthSettings(settings: CalendarOAuthSettings): Promise<void> {
  await db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).set(settings);
}

export async function getCalendarOAuthSettings(): Promise<CalendarOAuthSettings | null> {
  const doc = await db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).get();
  if (!doc.exists) return null;
  return doc.data() as CalendarOAuthSettings;
}

export async function updateCalendarToken(accessToken: string, expiryDate: Date): Promise<void> {
  await db.collection('settings').doc(OAUTH_SETTINGS_DOC_ID).update({
    accessToken,
    expiryDate
  });
}

export async function saveCalendarSettings(settings: CalendarSettings): Promise<void> {
  await db.collection('settings').doc(CALENDAR_SETTINGS_DOC_ID).set(settings);
}

export async function getCalendarSettings(): Promise<CalendarSettings | null> {
  const doc = await db.collection('settings').doc(CALENDAR_SETTINGS_DOC_ID).get();
  if (!doc.exists) return null;
  return doc.data() as CalendarSettings;
} 