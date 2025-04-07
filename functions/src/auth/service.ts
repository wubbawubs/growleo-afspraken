import { onCall, onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { verifyAuth } from './middleware';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

export const createUser = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  minInstances: 0,
  maxInstances: 10,
  region: 'us-central1'
}, async (request) => {
  try {
    const { email, password, firstName, lastName, role } = request.data;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { uid: userRecord.uid };
  } catch (error) {
    throw new Error('Error creating user');
  }
});

export const getUserProfile = onRequest({
  memory: '256MiB',
  timeoutSeconds: 60,
  minInstances: 0,
  maxInstances: 10,
  region: 'us-central1'
}, async (req, res) => {
  try {
    // Get user ID from query parameters
    const userId = req.query.userId;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(userId as string)
      .get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}); 