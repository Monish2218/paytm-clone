import { prisma } from '../../db/prisma';

/**
 * Fetches a user's profile by their ID.
 * @param userId - The ID of the user to fetch.
 * @returns The user object (excluding sensitive fields like passwordHash).
 * @throws Error if user is not found.
 */
export const getUserProfileService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        const error = new Error('User profile not found.');
        (error as any).statusCode = 404; // Not Found
        throw error;
    }
    return user;
};