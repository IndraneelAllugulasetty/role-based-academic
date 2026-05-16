import express from 'express';
import { 
    createClassroom, 
    getStudentClassrooms, 
    getFacultyClassrooms, 
    getAllClassrooms,
    getDepartmentClassrooms,
    getClassroomDetails, 
    postMaterial, 
    postAssignment, 
    submitAssignment,
    getClassroomStudents,
    getClassroomAnalytics
} from '../controllers/classroomController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin/HOD/Faculty can create classrooms
router.post('/create', verifyToken, authorizeRoles('admin', 'hod', 'faculty'), createClassroom);
router.get('/all', verifyToken, authorizeRoles('admin'), getAllClassrooms);
router.get('/department', verifyToken, authorizeRoles('hod'), getDepartmentClassrooms);

// Student routes
router.get('/student', verifyToken, authorizeRoles('student'), getStudentClassrooms);
router.post('/submit-assignment', verifyToken, authorizeRoles('student'), submitAssignment);

// Faculty/Admin/HOD routes
router.get('/faculty', verifyToken, authorizeRoles('faculty', 'hod', 'admin'), getFacultyClassrooms);
router.post('/post-material', verifyToken, authorizeRoles('faculty', 'hod', 'admin'), postMaterial);
router.post('/post-assignment', verifyToken, authorizeRoles('faculty', 'hod', 'admin'), postAssignment);

// Shared routes
router.get('/:id/details', verifyToken, authorizeRoles('faculty', 'hod', 'admin', 'student'), getClassroomDetails);
router.get('/:id/students', verifyToken, authorizeRoles('faculty', 'hod', 'admin', 'student'), getClassroomStudents);
router.get('/:id/analytics', verifyToken, authorizeRoles('faculty', 'hod', 'admin', 'student'), getClassroomAnalytics);

export default router;
