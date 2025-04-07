'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    calendarIntegration: 'google',
    calendarSettings: {
      type: 'google',
      syncEnabled: true
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add client via API route
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const { clientId } = await response.json();
      
      // If calendar integration is selected, redirect to calendar setup
      if (client.calendarIntegration) {
        router.push(`/dashboard/klanten/${clientId}/kalender`);
      } else {
        router.push('/dashboard/klanten');
      }

      toast.success('Klant succesvol toegevoegd');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Er is een fout opgetreden bij het toevoegen van de klant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nieuwe Klant</h1>
      </div>

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

          <div>
            <Label htmlFor="calendarIntegration">Kalender Integratie</Label>
            <Select
              value={client.calendarIntegration}
              onValueChange={(value) => setClient({ 
                ...client, 
                calendarIntegration: value,
                calendarSettings: {
                  ...client.calendarSettings,
                  type: value
                }
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer kalender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook Calendar</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuleren
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Bezig met opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </form>
    </div>
  );
} 