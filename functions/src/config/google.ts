import { OAuth2Client } from 'google-auth-library';
import { getCalendarOAuthSettings, updateCalendarToken } from '../calendar/settings';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  throw new Error('Missing required Google OAuth environment variables');
}

// Initialize OAuth2 client
export const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Setup token refresh handler
oauth2Client.on('tokens', async (tokens) => {
  if (tokens.access_token) {
    const expiryDate = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));
    await updateCalendarToken(tokens.access_token, expiryDate);
  }
});

// Initialize tokens from Firestore
export async function initializeOAuth2Client(): Promise<void> {
  const settings = await getCalendarOAuthSettings();
  if (settings) {
    oauth2Client.setCredentials({
      access_token: settings.accessToken,
      refresh_token: settings.refreshToken,
      expiry_date: settings.expiryDate.toDate().getTime()
    });
  }
} 