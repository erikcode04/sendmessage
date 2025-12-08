import type { Request, Response } from 'express';
import express from 'express';
import mongoDb from './database.ts';
import { ContactService } from './services/contactService.ts';
import { requireAuth, type AuthRequest } from './middleware/auth.ts';

const router = express.Router();
const contactService = new ContactService();


router.get('/health', async (req: Request, res: Response) => {
    try {
        const isConnected = mongoDb.isDbConnected();
        res.json({
            status: 'ok',
            database: isConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
});

// Contact routes
router.get('/contacts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const contacts = await contactService.getContacts(userId);
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

router.post('/contacts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { name, phoneNumber } = req.body;

        if (!name || !phoneNumber) {
            return res.status(400).json({ error: 'Name and phone number are required' });
        }

        const newContact = await contactService.createContact(userId, { name, phoneNumber });
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

router.delete('/contacts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const contactId = req.params.id;

        const success = await contactService.deleteContact(userId, contactId);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Message routes
router.get('/contacts/:contactId/messages', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const contactId = req.params.contactId;

        const messages = await contactService.getMessages(userId, contactId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/contacts/:contactId/messages', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const contactId = req.params.contactId;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const newMessage = await contactService.sendMessage(userId, contactId, { text });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;