import express from 'express';
import * as teacherController from '../controllers/teacherController.js';

const router = express.Router();

router.get('/dashboard', teacherController.getTeacherDashboard);
router.get('/profile', teacherController.getTeacherProfile);
router.put('/profile', teacherController.updateTeacherProfile);
router.get('/students', teacherController.getTeacherStudents);
router.get('/classes', teacherController.getTeacherClasses);
router.post('/attendance', teacherController.markAttendance);
router.get('/attendance', teacherController.getAttendanceRecords);
router.post('/marks', teacherController.uploadMarks);
router.get('/marks', teacherController.getMarksRecords);
router.get('/notices', teacherController.getTeacherNotices);

export default router;
