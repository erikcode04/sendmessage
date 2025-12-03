import type { Request, Response } from 'express';
import express from 'express';
import mongoDb from './database.ts';

const router = express.Router();


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

export default router;