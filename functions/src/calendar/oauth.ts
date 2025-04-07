import { oauth2Client } from '../config/google';
import { getFirestore } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();

export interface CalendarTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export async function getClientCalendarCredentials(clientId: string): Promise<CalendarTokens | null> {
  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) return null;

  const client = clientDoc.data();
  if (!client?.calendarCredentials) return null;

  return {
    access_token: client.calendarCredentials.accessToken,
    refresh_token: client.calendarCredentials.refreshToken,
    expiry_date: client.calendarCredentials.expiryDate.toDate().getTime()
  };
}

export async function saveClientCalendarCredentials(clientId: string, tokens: CalendarTokens): Promise<void> {
  await db.collection('clients').doc(clientId).update({
    calendarCredentials: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: Timestamp.fromMillis(tokens.expiry_date)
    },
    updatedAt: Timestamp.now()
  });
}

export async function handleOAuthCallback(code: string, clientId: string): Promise<CalendarTokens> {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    await saveClientCalendarCredentials(clientId, tokens);
    return tokens;
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw new Error('Failed to complete OAuth flow');
  }
}

export function getOAuthUrl(clientId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    state: clientId // Pass clientId in state for verification
  });
} 