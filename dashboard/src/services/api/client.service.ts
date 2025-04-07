import { Client, ClientCreateInput, ClientUpdateInput, ClientStatistics } from '@/types/client';

export class ClientService {
  private baseUrl = '/api';

  async getClients(): Promise<Client[]> {
    const response = await fetch(`${this.baseUrl}/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  }

  async getClient(id: string): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json();
  }

  async createClient(input: ClientCreateInput): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
  }

  async updateClient(id: string, input: ClientUpdateInput): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
  }

  async deleteClient(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/clients/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete client');
  }

  async getClientStats(clientId: string, startDate: Date, endDate: Date): Promise<ClientStatistics> {
    const response = await fetch(
      `${this.baseUrl}/tracking/client/${clientId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch client statistics');
    return response.json();
  }

  async getClientSettings(clientId: string): Promise<Client['settings']> {
    const response = await fetch(`${this.baseUrl}/clients/${clientId}/settings`);
    if (!response.ok) throw new Error('Failed to fetch client settings');
    return response.json();
  }

  async updateClientSettings(clientId: string, settings: Client['settings']): Promise<Client['settings']> {
    const response = await fetch(`${this.baseUrl}/clients/${clientId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update client settings');
    return response.json();
  }
} 