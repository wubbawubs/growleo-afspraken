import { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { ClientService } from '@/services/api/client.service';

const clientService = new ClientService();

export function useClient(clientId: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await clientService.getClient(clientId);
        setClient(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch client'));
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const updateClient = async (updates: Partial<Client>) => {
    try {
      setLoading(true);
      const updatedClient = await clientService.updateClient(clientId, updates);
      setClient(updatedClient);
      setError(null);
      return updatedClient;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update client'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async () => {
    try {
      setLoading(true);
      await clientService.deleteClient(clientId);
      setClient(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete client'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    client,
    loading,
    error,
    updateClient,
    deleteClient
  };
} 