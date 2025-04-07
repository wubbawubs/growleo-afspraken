'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client } from '@/types/client';
import { useRouter } from 'next/navigation';

interface EditClientFormProps {
  initialClient: Client;
}

export default function EditClientForm({ initialClient }: EditClientFormProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client>(initialClient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier komt later de logica voor het opslaan van de klantgegevens
    console.log('Client data submitted:', client);
    router.push('/dashboard/klanten');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Naam</Label>
          <Input
            id="name"
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefoon</Label>
          <Input
            id="phone"
            type="tel"
            value={client.phone}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="company">Bedrijf</Label>
          <Input
            id="company"
            value={client.company}
            onChange={(e) => setClient({ ...client, company: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notities</Label>
          <textarea
            id="notes"
            value={client.notes}
            onChange={(e) => setClient({ ...client, notes: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-growleo focus:ring-growleo sm:text-sm"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuleren
        </Button>
        <Button type="submit">
          Opslaan
        </Button>
      </div>
    </form>
  );
} 