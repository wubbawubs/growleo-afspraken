"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.getClient = getClient;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
exports.listClients = listClients;
exports.updateClientStatistics = updateClientStatistics;
const service_1 = require("./service");
async function createClient(req, res) {
    try {
        const input = req.body;
        const client = await service_1.clientService.createClient(input);
        return res.status(201).json(client);
    }
    catch (error) {
        console.error('Error creating client:', error);
        return res.status(500).json({ error: 'Failed to create client' });
    }
}
async function getClient(req, res) {
    try {
        const client = await service_1.clientService.getClient(req.params.id);
        if (client === null) {
            return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(200).json(client);
    }
    catch (error) {
        console.error('Error getting client:', error);
        return res.status(500).json({ error: 'Failed to get client' });
    }
}
async function updateClient(req, res) {
    try {
        const input = req.body;
        const client = await service_1.clientService.updateClient(req.params.id, input);
        if (client === null) {
            return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(200).json(client);
    }
    catch (error) {
        console.error('Error updating client:', error);
        return res.status(500).json({ error: 'Failed to update client' });
    }
}
async function deleteClient(req, res) {
    try {
        const success = await service_1.clientService.deleteClient(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting client:', error);
        return res.status(500).json({ error: 'Failed to delete client' });
    }
}
async function listClients(req, res) {
    try {
        const clients = await service_1.clientService.listClients();
        return res.status(200).json(clients);
    }
    catch (error) {
        console.error('Error listing clients:', error);
        return res.status(500).json({ error: 'Failed to list clients' });
    }
}
async function updateClientStatistics(req, res) {
    try {
        const client = await service_1.clientService.updateClientStatistics(req.params.id);
        if (client === null) {
            return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(200).json(client);
    }
    catch (error) {
        console.error('Error updating client statistics:', error);
        return res.status(500).json({ error: 'Failed to update client statistics' });
    }
}
//# sourceMappingURL=api.js.map