import * as admin from 'firebase-admin';

export async function generateCustomToken(uid: string, claims: { [key: string]: any } = {}): Promise<string> {
  try {
    return await admin.auth().createCustomToken(uid, claims);
  } catch (error) {
    console.error('Error generating custom token:', error);
    throw error;
  }
}