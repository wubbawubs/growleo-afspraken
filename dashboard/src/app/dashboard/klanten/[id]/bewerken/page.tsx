import { Suspense } from 'react';
import { mockClients } from '@/lib/mock-data';
import { Client } from '@/types/client';
import EditClientForm from './edit-client-form';

export async function generateStaticParams() {
  // Get all client IDs from your data source
  const clientIds = mockClients.map(client => ({
    id: client.id
  }));
  
  return clientIds;
}

export default function EditClientPage({ params }: { params: { id: string } }) {
  const client = mockClients.find(c => c.id === params.id);

  if (!client) {
    return <div>Klant niet gevonden</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Klant Bewerken - {client.name}</h1>
      </div>

      <Suspense fallback={<div>Laden...</div>}>
        <EditClientForm initialClient={client} />
      </Suspense>
    </div>
  );
} 