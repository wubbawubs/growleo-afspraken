import { NextResponse } from 'next/server';
import { oauth2Client } from '@/lib/google';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Parse state to get clientId and calendarType
    const { clientId, calendarType } = JSON.parse(state);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Update client document with calendar credentials
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      calendarSettings: {
        type: calendarType,
        syncEnabled: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date || Date.now() + 3600 * 1000).toISOString()
      }
    });

    // Redirect back to client calendar page
    return NextResponse.redirect(new URL(`/dashboard/klanten/${clientId}/kalender`, request.url));
  } catch (error) {
    console.error('Error handling callback:', error);
    return NextResponse.json(
      { error: 'Failed to handle callback' },
      { status: 500 }
    );
  }
} 