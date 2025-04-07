'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CalendarIntegrationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const docRef = doc(db, 'clients', params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setClient(docSnap.data() as Client);
        } else {
          toast.error('Klant niet gevonden');
          router.push('/dashboard/klanten');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        toast.error('Er is een fout opgetreden bij het ophalen van de klant');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.id, router]);

  const handleConnectCalendar = async () => {
    if (!client) return;
    
    setConnecting(true);
    try {
      // Redirect to Google OAuth consent screen
      const response = await fetch('/api/calendar/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          calendarType: client.calendarIntegration
        }),
      });

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast.error('Er is een fout opgetreden bij het verbinden van de kalender');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!client) return;

    try {
      await updateDoc(doc(db, 'clients', client.id), {
        calendarSettings: {
          ...client.calendarSettings,
          syncEnabled: false,
          accessToken: null,
          refreshToken: null
        }
      });

      setClient({
        ...client,
        calendarSettings: {
          ...client.calendarSettings,
          syncEnabled: false,
          accessToken: null,
          refreshToken: null
        }
      });

      toast.success('Kalender succesvol losgekoppeld');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Er is een fout opgetreden bij het loskoppelen van de kalender');
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!client) {
    return <div>Klant niet gevonden</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kalender Integratie - {client.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kalender Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Geselecteerde Kalender</p>
              <p className="text-sm text-gray-500">{client.calendarIntegration}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-gray-500">
                {client.calendarSettings?.syncEnabled ? 'Verbonden' : 'Niet verbonden'}
              </p>
            </div>

            {client.calendarSettings?.syncEnabled ? (
              <Button
                variant="destructive"
                onClick={handleDisconnectCalendar}
              >
                Kalender Loskoppelen
              </Button>
            ) : (
              <Button
                onClick={handleConnectCalendar}
                disabled={connecting}
              >
                {connecting ? 'Verbinden...' : 'Kalender Verbinden'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 