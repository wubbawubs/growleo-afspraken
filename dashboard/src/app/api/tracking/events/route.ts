import { NextRequest, NextResponse } from 'next/server';
import { getFunctions } from 'firebase-admin/functions';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import path from 'path';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), './growleo-afspraken-909155e896e5.json');
  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    if (!event.type || !event.clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and clientId' },
        { status: 400 }
      );
    }

    // Call the Cloud Function to track the event
    const functions = getFunctions();
    const trackEvent = functions.httpsCallable('trackEvent');
    
    await trackEvent(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
} 