import { prisma } from '../../db/prisma';
import { UserRole } from '../../../generated/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken, AccessTokenPayload } from '../../utils/jwtHelpers';
import { RegisterInput, LoginInput } from './auth.validators';

const SALT_ROUNDS = 10;

/**
 * Registers a new user.
 * Hashes the password and creates a user and associated wallet in a transaction.
 * @param input - Validated registration data.
 * @returns The created user object (excluding password hash).
 * @throws Error if user already exists.
 */
export const registerUserService = async (input: RegisterInput) => {
  const { email, password, name, role } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('A user with this email address already exists.');
    (error as any).statusCode = 409; // Conflict
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: name ?? null,
        role: role as UserRole,
      },
    });

    await tx.wallet.create({
      data: {
        userId: user.id,
        balance: 0.00,
      },
    });
    return user;
  });

  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Logs in an existing user.
 * Verifies credentials and generates an access token.
 * @param input - Validated login data.
 * @returns An object containing the user (excluding password hash) and the access token.
 * @throws Error if credentials are invalid or user not found.
 */
export const loginUserService = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password.');
    (error as any).statusCode = 401; // Unauthorized
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    (error as any).statusCode = 401;
    throw error;
  }

  const tokenPayload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(tokenPayload);

  const { passwordHash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken };
};