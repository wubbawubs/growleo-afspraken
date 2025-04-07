import { Client } from '@/types/client';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClientGridProps {
  clients: Client[]
}

export function ClientGrid({ clients }: ClientGridProps) {
  const getAppointmentCount = (client: Client) => {
    if (Array.isArray(client.appointments)) {
      return client.appointments.length;
    }
    return client.appointments || 0;
  };

  return (
    <div className="grid gap-4">
      {clients.map((client) => (
        <Card key={client.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                {client.status === 'active' ? 'Actief' : 'Inactief'}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Afspraken:</span>
                <span className="ml-2 font-medium">{getAppointmentCount(client)}</span>
              </div>
              <div>
                <span className="text-gray-500">Conversie:</span>
                <span className="ml-2 font-medium">{client.conversion || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}