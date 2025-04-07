'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/client';

interface CalendarSettingsFormProps {
  initialClient: Client;
}

export default function CalendarSettingsForm({ initialClient }: CalendarSettingsFormProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client>(initialClient);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Hier komt later de API call om de wijzigingen op te slaan
      console.log('Saving calendar settings:', client);
      router.push('/dashboard/klanten');
    } catch (error) {
      console.error('Error saving calendar settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kalender Integratie</label>
            <Select
              value={client.calendarIntegration}
              onValueChange={(value) => setClient({ ...client, calendarIntegration: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer kalender" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook Calendar</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Beschikbare Tijden</label>
            <div className="space-y-2">
              {client.availableTimes?.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...(client.availableTimes || [])];
                      newTimes[index] = e.target.value;
                      setClient({ ...client, availableTimes: newTimes });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-growleo focus:ring-growleo sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTimes = client.availableTimes?.filter((_, i) => i !== index);
                      setClient({ ...client, availableTimes: newTimes });
                    }}
                  >
                    Verwijderen
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newTimes = [...(client.availableTimes || []), '09:00'];
                  setClient({ ...client, availableTimes: newTimes });
                }}
              >
                Tijd Toevoegen
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Beschikbare Dagen</label>
            <div className="space-y-2">
              {['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'].map((day) => (
                <div key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={client.availableDays?.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...(client.availableDays || []), day]
                        : client.availableDays?.filter(d => d !== day);
                      setClient({ ...client, availableDays: newDays });
                    }}
                    className="h-4 w-4 text-growleo focus:ring-growleo border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">{day}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Annuleren
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Bezig met opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </div>
  );
} 