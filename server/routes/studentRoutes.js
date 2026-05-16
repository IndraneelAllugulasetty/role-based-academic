import express from 'express';
import * as studentController from '../controllers/studentController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('student'));

router.get('/stats', studentController.getStudentDashboardStats);
router.get('/profile', studentController.getStudentProfile);
router.get('/attendance', studentController.getStudentAttendance);
router.get('/results', studentController.getStudentResults);
router.get('/subjects', studentController.getStudentSubjects);
router.get('/marks', studentController.getStudentInternalMarks);
router.get('/announcements', studentController.getStudentAnnouncements);
router.get('/events', studentController.getStudentEvents);
router.get('/classmates', studentController.getStudentClassmates);
router.get('/faculty', studentController.getStudentFaculty);
router.post('/feedback', studentController.submitFeedback);
router.get('/ai-analysis', studentController.getStudentAiAnalysis);

export default router;
