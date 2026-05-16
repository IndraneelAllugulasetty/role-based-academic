import express from 'express';
import { 
    loginUser, 
    registerUser, 
    getCurrentUser, 
    verifyToken as verifyTokenController,
    changePassword,
    updateProfile,
    deleteAccount
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', verifyToken, getCurrentUser);
router.get('/verify', verifyTokenController);
router.put('/change-password', verifyToken, changePassword);
router.put('/update-profile', verifyToken, updateProfile);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;
