import { Request, Response } from 'express';
import { clientService } from './service';
import { Client } from '../types/client';
import { ClientCreateInput, ClientUpdateInput } from '../types/client';

export async function createClient(req: Request, res: Response) {
  try {
    const input = req.body as ClientCreateInput;
    
    // Validate required fields
    if (!input.name || !input.email) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email']
      });
    }

    const client = await clientService.createClient(input);
    
    // Log the client creation
    await clientService.logActivity(client.id, {
      type: 'client_created',
      description: `New client ${client.name} created`,
      timestamp: new Date()
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ error: 'Failed to create client' });
  }
}

export async function getClient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const client = await clientService.getClient(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    return res.status(500).json({ error: 'Failed to get client' });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const input = req.body as ClientUpdateInput;
    
    const client = await clientService.updateClient(id, input);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Log the client update
    await clientService.logActivity(id, {
      type: 'client_updated',
      description: `Client ${client.name} updated`,
      timestamp: new Date()
    });

    return res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Failed to update client' });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await clientService.deleteClient(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
}

export async function listClients(req: Request, res: Response) {
  try {
    const clients = await clientService.listClients();
    return res.json(clients);
  } catch (error) {
    console.error('Error listing clients:', error);
    return res.status(500).json({ error: 'Failed to list clients' });
  }
}

export async function updateClientStatistics(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    await clientService.updateClientStatistics(clientId);
    const client = await clientService.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json(client.statistics);
  } catch (error) {
    console.error('Error updating client statistics:', error);
    return res.status(500).json({ error: 'Failed to update client statistics' });
  }
}

export async function getClientSettings(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const client = await clientService.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json(client.settings);
  } catch (error) {
    console.error('Error getting client settings:', error);
    return res.status(500).json({ error: 'Failed to get client settings' });
  }
}

export async function updateClientSettings(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const settings = req.body;
    
    const client = await clientService.updateClient(clientId, { settings });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json(client.settings);
  } catch (error) {
    console.error('Error updating client settings:', error);
    return res.status(500).json({ error: 'Failed to update client settings' });
  }
}