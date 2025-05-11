import express, { Router } from 'express';
import { handleLogin, handleLogout, handleRegister } from './auth.controller';

const router: Router = express.Router();

router.post('/register', handleRegister);

router.post('/login', handleLogin);

router.post('/logout', handleLogout);

export default router;