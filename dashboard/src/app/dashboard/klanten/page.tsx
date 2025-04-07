'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockClients } from '@/lib/mock-data';
import { Client } from '@/types/client';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleAddClient = () => {
    router.push('/dashboard/klanten/nieuw');
  };

  const handleEditClient = (id: string) => {
    router.push(`/dashboard/klanten/${id}/bewerken`);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  const handleCalendarSettings = (id: string) => {
    router.push(`/dashboard/klanten/${id}/kalender`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Klanten</h1>
        <Button onClick={handleAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Klant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Naam</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Telefoon</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Kalender</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.calendarIntegration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.lastAppointment ? new Date(client.lastAppointment).toLocaleDateString('nl-NL') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCalendarSettings(client.id)}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClient(client.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 