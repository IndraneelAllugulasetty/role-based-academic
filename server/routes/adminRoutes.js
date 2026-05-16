import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all admin routes
router.use(verifyToken);
router.use(authorizeRoles('admin'));

router.get('/dashboard', adminController.getAdminDashboardStats);
router.get('/stats', adminController.getAdminDashboardStats);
router.post('/students/register', adminController.registerStudent);
router.post('/teachers/register', adminController.registerTeacher);
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.get('/teachers', adminController.getAllTeachers);
router.get('/teachers/:id', adminController.getTeacherById);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

router.get('/departments', adminController.getAllDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/semesters', adminController.getAllSemesters);
router.get('/subjects', adminController.getAllSubjects);
router.post('/semesters', adminController.createSemester);
router.put('/semesters/:id', adminController.updateSemester);
router.delete('/semesters/:id', adminController.deleteSemester);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.post('/notices', adminController.createNotice);
router.get('/notices', adminController.getAllNotices);
router.delete('/notices/:id', adminController.deleteNotice);
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);

export default router;
