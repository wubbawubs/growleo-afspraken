import * as admin from 'firebase-admin';
import * as path from 'path';

// Gebruik een relatief pad vanaf de functions directory
const serviceAccountPath = path.resolve(__dirname, '../../../growleo-afspraken-909155e896e5.json');

console.log('Loading service account from:', serviceAccountPath);

try {
  // Initialiseer Firebase Admin als het nog niet is geïnitialiseerd
  if (!admin.apps.length) {
    // Configure to use auth emulator in development
    if (process.env.FUNCTIONS_EMULATOR) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      console.log('🔧 Using Auth Emulator at localhost:9099');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL: 'https://growleo-afspraken.firebaseio.com'
    });
    
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw error;
}

// Initialiseer Firestore
const db = admin.firestore();
// Stel de regio in voor betere prestaties
db.settings({ 
  ignoreUndefinedProperties: true 
});

export { admin, db };