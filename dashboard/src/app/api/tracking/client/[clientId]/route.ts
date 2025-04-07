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

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing startDate or endDate parameters' },
        { status: 400 }
      );
    }

    // Call the Cloud Function to get client stats
    const functions = getFunctions();
    const getClientStats = functions.httpsCallable('getClientStats');
    
    const result = await getClientStats({
      clientId: params.clientId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client statistics' },
      { status: 500 }
    );
  }
} 