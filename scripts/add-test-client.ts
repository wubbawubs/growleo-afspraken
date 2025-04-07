import { createClient } from '../lib/services/client';
import { auth } from '../lib/firebase/config';
import { Client } from '../types/client';

async function addTestClient() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const testClient = await createClient({
      name: 'Test Klant',
      email: 'test@growleo.com',
      agencyId: user.uid
    });

    console.log('Test client added successfully:', testClient);
  } catch (error) {
    console.error('Error adding test client:', error);
  }
}

addTestClient(); 