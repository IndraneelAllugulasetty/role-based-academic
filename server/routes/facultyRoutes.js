import express from 'express';
import { getAssignedSubjects, getDepartmentSubjects, addSubject, getStudentsBySubject, markAttendance, enterInternalMarks } from '../controllers/facultyController.js';
import { getAllSemesters } from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('faculty', 'hod'));

router.get('/subjects', getAssignedSubjects);
router.get('/all-subjects', getDepartmentSubjects);
router.get('/semesters', getAllSemesters);
router.post('/subjects', addSubject);
router.get('/students/:subjectId', getStudentsBySubject);
router.post('/attendance', markAttendance);
router.post('/marks', enterInternalMarks);

export default router;
