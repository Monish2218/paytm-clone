import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validators";
import { ZodError } from "zod";
import * as authService from "./auth.service";

export const handleRegister = async (req: Request, res: Response) => {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const user = await authService.registerUserService(validatedInput);
      res.status(201).json({ message: 'User registered successfully. Please login.', userId: user.id });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
        return;
      }
      if (error.statusCode === 409) { // User already exists
        res.status(409).json({ message: error.message });
        return;
      }
      console.error("Registration Route Error:", error.message, error.stack);
      res.status(500).json({ message: 'An unexpected error occurred during registration.' });
    }
};

export const handleLogin = async (req: Request, res: Response) => {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const { user, accessToken } = await authService.loginUserService(validatedInput);
  
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE_SECONDS ?? (15 * 60).toString()) * 1000,
      });
  
      res.status(200).json({
        message: 'Login successful',
        user,
      });
  
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
        return;
      }
      if (error.statusCode === 401) { // Invalid credentials
        res.status(401).json({ message: error.message });
        return;
      }
      console.error("Login Route Error:", error.message, error.stack);
      res.status(500).json({ message: 'An unexpected error occurred during login.' });
    }
}

export const handleLogout = (req: Request, res: Response) => {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({ message: 'Logout successful' });
}