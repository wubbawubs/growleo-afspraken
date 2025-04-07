import { NextResponse } from 'next/server';
import { oauth2Client } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { clientId, calendarType } = await request.json();

    if (!clientId || !calendarType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate OAuth URL with the correct redirect URI
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state: JSON.stringify({ clientId, calendarType }),
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
} 