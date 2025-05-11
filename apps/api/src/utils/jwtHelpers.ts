import jwt, { Secret } from 'jsonwebtoken';
import type { StringValue } from "ms";

const JWT_SECRET = process.env.JWT_SECRET ?? 'YOUR_VERY_SECRET_KEY_REPLACE_THIS_IN_ENV_FILE' as Secret;
const JWT_ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '15m') as StringValue;

export interface AccessTokenPayload {
    sub: string; // User ID (subject)
    email: string;
    role: string;
}

/**
 * Generates a JWT Access Token.
 * @param {AccessTokenPayload} payload - The payload to include in the token.
 * @returns {string} - The generated JWT Access Token.
*/
export const generateAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
};

/**
 * Verifies a JWT Access Token and returns the decoded payload.
 * @param {string} token - The JWT Access Token to verify.
 * @returns {AccessTokenPayload | null} - The decoded payload if the token is valid, otherwise null.
*/
export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    } catch (error) {
        console.error('JWT Verification Failed:', (error as Error).message);
        return null;
    }
};