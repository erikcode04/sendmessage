import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.ts';

const userService = new UserService();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const result = await userService.verifyToken(token);
        if (result.valid && result.user) {
            req.user = {
                id: result.user.id,
                email: result.user.email
            };
            next();
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};
