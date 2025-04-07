import { jest, afterAll } from '@jest/globals';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin voor tests
admin.initializeApp({
  projectId: 'demo-project',
});

// Cleanup na tests
afterAll(async () => {
  await admin.app().delete();
});