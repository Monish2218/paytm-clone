import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from '../../utils/jwtHelpers';

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

/**
 * Middleware to authenticate JWT access tokens from HttpOnly cookie.
 * If valid, attaches decoded user payload to `req.user`.
*/
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies?.accessToken, 'cookies');
    const token = req.cookies?.accessToken;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Access token not provided.' });
        return;
    }

    const decodedPayload = verifyAccessToken(token);

    if (!decodedPayload) {
        res.clearCookie('accesToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.status(401).json({ message: 'Unauthorized: Invalid access token or expired token.' });
        return;
    }

    req.user = decodedPayload;
    next();
};
