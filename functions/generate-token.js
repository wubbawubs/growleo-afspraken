// functions/generate-token.js
const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.resolve('/Users/luukwubs/growleo-afspraken/growleo-afspraken-909155e896e5.json');

// Configure to use auth emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
console.log('🔧 Using Auth Emulator at localhost:9099');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
}

// Direct een custom token maken voor de bestaande gebruiker
admin.auth()
  .createCustomToken('test-admin-user', { role: 'admin' })
  .then(token => {
    console.log('Custom token:', token);
    console.log('\nGebruik deze token om in te loggen via de Firebase Auth Emulator:');
    console.log(`curl -X POST 'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key' \\
    -H 'Content-Type: application/json' \\
    -d '{
      "token": "${token}",
      "returnSecureToken": true
    }'`);
  })
  .catch(error => {
    console.error('Error:', error);
  });