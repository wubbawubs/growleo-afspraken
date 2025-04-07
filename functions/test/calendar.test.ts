import axios from 'axios';
import * as admin from 'firebase-admin';

// Firebase setup voor tests
admin.initializeApp({
  projectId: 'growleo-afspraken',
  credential: admin.credential.applicationDefault()
});

// Configureer de emulator URLs
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const BASE_URL = 'http://localhost:5001/growleo-afspraken/europe-west1/api';

async function getTestToken() {
  try {
    // 1. Eerst een custom token maken
    const customToken = await admin.auth().createCustomToken('test-admin-user', {
      role: 'admin'
    });

    // 2. Custom token omwisselen voor ID token via Auth emulator
    const response = await axios.post(
      `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );

    // 3. ID token returnen
    return response.data.idToken;
  } catch (error) {
    console.error('Error getting test token:', error);
    throw error;
  }
}

async function testCalendarEndpoints() {
  try {
    console.log('🎯 Starting Calendar API tests...');
    console.log('Environment:', process.env.NODE_ENV);  // Debug log toevoegen

    // 1. Get test token
    console.log('\n1️⃣  Getting test token...');
    const idToken = await getTestToken();
    console.log('✅ Test token received');

    const headers = {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    };

    // 2. Test /calendar/connect
    console.log('\n2️⃣  Testing /calendar/connect...');
    const connectResponse = await axios.get(`${BASE_URL}/calendar/connect`, { headers });
    console.log('✅ Connect response:', connectResponse.data);

    // 3. Simulate OAuth callback
    console.log('\n3️⃣  Simulating OAuth callback...');
    const callbackResponse = await axios.get(`${BASE_URL}/calendar/callback`, {
      headers,
      params: {
        code: 'test_auth_code'  // We're in test mode so this value doesn't matter
      }
    });
    console.log('✅ Callback response:', callbackResponse.data);

    // Add delay to ensure Firestore is updated
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Test /calendar/status
    console.log('\n4️⃣  Testing /calendar/status...');
    const statusResponse = await axios.get(`${BASE_URL}/calendar/status`, { headers });
    console.log('✅ Status response:', statusResponse.data);

    // Nu pas availability testen
    console.log('\n5️⃣  Testing /calendar/available-slots...');
    const startDate = '2025-04-04';
    const endDate = '2025-04-05';
    const availabilityResponse = await axios.get(`${BASE_URL}/calendar/available-slots`, {
      headers,
      params: {
        startDate,
        endDate
      }
    });
    console.log('✅ Available slots response:', availabilityResponse.data);

    // 6. Test creating an appointment with email
    console.log('\n6️⃣  Testing appointment creation with email...');
    const appointmentData = {
      clientId: 'test-client-id',
      title: 'Test Appointment',
      description: 'This is a test appointment',
      attendees: [
        {
          email: 'test@example.com',
          name: 'Test User'
        }
      ],
      startTime: availabilityResponse.data.slots[0].startTime,
      endTime: availabilityResponse.data.slots[0].endTime,
      status: 'scheduled'
    };

    const createResponse = await axios.post(`${BASE_URL}/appointments`, appointmentData, { headers });
    console.log('✅ Appointment created:', createResponse.data);

    // 7. Test getting appointment status
    console.log('\n7️⃣  Testing appointment status...');
    const appointmentId = createResponse.data.id;
    const appointmentStatus = await axios.get(`${BASE_URL}/appointments/${appointmentId}/status`, { headers });
    console.log('✅ Appointment status:', appointmentStatus.data);

    console.log('\n✨ All tests passed!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Test failed:', error.response?.data || error.message);
      console.error('Error details:', error.response?.data);
    } else {
      console.error('❌ Test failed:', error);
    }
    process.exit(1);
  }
}

testCalendarEndpoints();

describe('Email Flow Tests', () => {
  it('should send confirmation email when creating appointment', async () => {
    // Test appointment creation met email check
  });

  it('should send status update email when status changes', async () => {
    // Test status update met email check
  });
}); 