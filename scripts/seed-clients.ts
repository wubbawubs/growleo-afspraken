import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with service account
initializeApp({
  credential: cert(require('../growleo-afspraken-1ed6c4d0d37b.json'))
});

const db = getFirestore();

const testClients = [
  {
    name: "GrowLeo Sales",
    email: "sales@growleo.nl",
    agencyId: "growleo",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "GrowLeo Marketing",
    email: "marketing@growleo.nl",
    agencyId: "growleo",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedClients() {
  try {
    for (const client of testClients) {
      const docRef = await db.collection('clients').add(client);
      console.log(`Added client with ID: ${docRef.id}`);
    }
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding clients:", error);
    process.exit(1);
  }
}

seedClients(); 