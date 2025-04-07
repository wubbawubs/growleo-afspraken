import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const clientData = await request.json();

    // Add client to Firestore
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statistics: {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        showUpRate: 0
      }
    });

    return NextResponse.json({ 
      success: true, 
      clientId: docRef.id 
    });
  } catch (error) {
    console.error('Error adding client:', error);
    return NextResponse.json(
      { error: 'Failed to add client' },
      { status: 500 }
    );
  }
}