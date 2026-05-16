import express from 'express';
import { 
    getDepartmentStats, getDepartmentFaculty, 
    getDepartmentStudents, assignFacultySubject,
    getDepartmentSubjects, getDepartmentSemesters, getDepartmentInfo,
    getFacultyAssignments, getDepartmentAnalytics
} from '../controllers/hodController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('hod'));

router.get('/stats', getDepartmentStats);
router.get('/faculty', getDepartmentFaculty);
router.get('/students', getDepartmentStudents);
router.post('/assign-subject', assignFacultySubject);
router.get('/subjects', getDepartmentSubjects);
router.get('/teachers', getDepartmentFaculty);
router.get('/semesters', getDepartmentSemesters);
router.get('/departments', getDepartmentInfo);
router.get('/faculty-assignments', getFacultyAssignments);
router.get('/analytics', getDepartmentAnalytics);

export default router;
