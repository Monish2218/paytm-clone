import express, { Request, Response, Router } from 'express';
import { authenticateJWT } from '../auth/auth.middleware';
import * as userService from './user.service';

const router: Router = express.Router();

router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        return;
    }

    try {
        const userProfile = await userService.getUserProfileService(userId);
        res.status(200).json(userProfile);
    } catch (error: any) {
        if (error.statusCode === 404) {
            res.status(404).json({ message: error.message });
            return;
        }
        console.error("Get User Profile Route Error:", error.message, error.stack);
        res.status(500).json({ message: 'An unexpected error occurred while fetching user profile.' });
    }
});

export default router;