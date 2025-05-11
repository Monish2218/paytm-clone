import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "A valid email address is required." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    name: z.string().min(1, { message: "Name is required." }).optional(), // Making name optional for now
    role: z.enum(['USER', 'MERCHANT'], { errorMap: () => ({ message: "Role must be either USER or MERCHANT."}) }).optional().default('USER'),
  });
  
export const loginSchema = z.object({
email: z.string().email({ message: "A valid email address is required." }),
password: z.string().min(1, { message: "Password is required." }),
});
  
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;