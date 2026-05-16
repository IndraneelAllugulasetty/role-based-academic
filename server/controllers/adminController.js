import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { sendNotification } from './notificationController.js';

export const getAdminDashboardStats = async (req, res) => {
    try {
        const [studentCount] = await db.execute('SELECT COUNT(*) as count FROM students');
        const [facultyCount] = await db.execute('SELECT COUNT(*) as count FROM faculty');
        const [deptCount] = await db.execute('SELECT COUNT(*) as count FROM departments');
        const [noticeCount] = await db.execute('SELECT COUNT(*) as count FROM announcements');

        res.status(200).json({ 
            success: true, 
            data: { 
                students: studentCount[0].count, 
                faculty: facultyCount[0].count, 
                departments: deptCount[0].count,
                notices: noticeCount[0].count
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const registerStudent = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, password, roll_no, registration_no, department_id, semester_id, section, batch_year, dob, phone } = req.body;
        
        // Check if user already exists
        const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Insert into users table
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, department_id, phone, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'student', department_id, phone || null, dob || null]
        );
        
        const userId = userResult.insertId;

        // 2. Insert into students table
        await connection.execute(
            'INSERT INTO students (user_id, student_roll_no, registration_no, department_id, semester_id, section, batch_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, roll_no, registration_no, department_id, semester_id, section, batch_year]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Student registered successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const registerTeacher = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, password, employee_id, department_id, designation, role } = req.body;
        
        // Check if user already exists
        const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Insert into users table
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, department_id, phone, dob, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'faculty', department_id, req.body.phone || null, req.body.dob || null, designation || null]
        );
        
        const userId = userResult.insertId;

        // 2. Insert into faculty table
        await connection.execute(
            'INSERT INTO faculty (user_id, faculty_employee_id, department_id, designation) VALUES (?, ?, ?, ?)',
            [userId, employee_id, department_id, designation]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Faculty registered successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const [students] = await db.execute(`
            SELECT s.*, u.name, u.email, u.status, d.name as department_name, sem.semester_number 
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN departments d ON s.department_id = d.id
            JOIN semesters sem ON s.semester_id = sem.id
        `);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const [student] = await db.execute(`
            SELECT s.*, u.name, u.email, u.status, d.name as department_name, sem.semester_number 
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN departments d ON s.department_id = d.id
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (student.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        res.status(200).json({ success: true, data: student[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStudent = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, roll_no, registration_no, department_id, semester_id, section, batch_year, dob, phone, status } = req.body;
        const studentId = req.params.id;

        // Get user_id first
        const [student] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) throw new Error('Student not found');
        const userId = student[0].user_id;

        // Update users table
        await connection.execute(
            'UPDATE users SET name = ?, email = ?, status = ?, department_id = ?, phone = ?, dob = ? WHERE id = ?',
            [name, email, status, department_id, phone || null, dob || null, userId]
        );

        // Update students table
        await connection.execute(
            'UPDATE students SET student_roll_no = ?, registration_no = ?, department_id = ?, semester_id = ?, section = ?, batch_year = ? WHERE id = ?',
            [roll_no, registration_no, department_id, semester_id, section, batch_year, studentId]
        );

        await connection.commit();
        res.status(200).json({ success: true, message: "Student updated successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const deleteStudent = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const studentId = req.params.id;

        // Get user_id first
        const [student] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) throw new Error('Student not found');
        const userId = student[0].user_id;

        // Delete from users (cascades to students)
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.status(200).json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const [faculty] = await db.execute(`
            SELECT f.*, u.name, u.email, u.status, d.name as department_name 
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            JOIN departments d ON f.department_id = d.id
        `);
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeacherById = async (req, res) => {
    try {
        const [faculty] = await db.execute(`
            SELECT f.*, u.name, u.email, u.status, d.name as department_name 
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            JOIN departments d ON f.department_id = d.id
            WHERE f.id = ?
        `, [req.params.id]);
        
        if (faculty.length === 0) {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }
        
        res.status(200).json({ success: true, data: faculty[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTeacher = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, employee_id, department_id, designation, status } = req.body;
        const facultyId = req.params.id;

        // Get user_id first
        const [faculty] = await connection.execute('SELECT user_id FROM faculty WHERE id = ?', [facultyId]);
        if (faculty.length === 0) throw new Error('Faculty not found');
        const userId = faculty[0].user_id;

        // Update users table
        await connection.execute(
            'UPDATE users SET name = ?, email = ?, status = ?, department_id = ?, phone = ?, dob = ? WHERE id = ?',
            [name, email, status, department_id, req.body.phone || null, req.body.dob || null, userId]
        );

        // Update faculty table
        await connection.execute(
            'UPDATE faculty SET faculty_employee_id = ?, department_id = ?, designation = ? WHERE id = ?',
            [employee_id, department_id, designation, facultyId]
        );

        await connection.commit();
        res.status(200).json({ success: true, message: "Faculty updated successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const deleteTeacher = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const facultyId = req.params.id;

        // Get user_id first
        const [faculty] = await connection.execute('SELECT user_id FROM faculty WHERE id = ?', [facultyId]);
        if (faculty.length === 0) throw new Error('Faculty not found');
        const userId = faculty[0].user_id;

        // Delete from users (cascades to faculty)
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.status(200).json({ success: true, message: "Faculty deleted successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.*, d.name as department_name 
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
        `);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, role, department_id, status } = req.body;
        const userId = req.params.id;

        // Update users table
        await connection.execute(
            'UPDATE users SET name = ?, email = ?, role = ?, department_id = ?, status = ?, phone = ?, dob = ? WHERE id = ?',
            [name, email, role, department_id || null, status || 'active', req.body.phone || null, req.body.dob || null, userId]
        );

        // If user is faculty/hod, update faculty table too if department changed
        const [faculty] = await connection.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length > 0) {
            await connection.execute(
                'UPDATE faculty SET department_id = ? WHERE user_id = ?',
                [department_id, userId]
            );
        }

        await connection.commit();
        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const createNotice = async (req, res) => {
    try {
        const { title, content, visibility_scope, department_id, publish_date } = req.body;
        const created_by = req.user.id;
        
        await db.execute(
            'INSERT INTO announcements (title, content, created_by, visibility_scope, department_id, publish_date) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content, created_by, visibility_scope, department_id || null, publish_date]
        );

        // Send notifications to relevant users
        let userQuery = 'SELECT id FROM users';
        let queryParams = [];

        if (visibility_scope === 'faculty') {
            userQuery += " WHERE role IN ('faculty', 'hod')";
        } else if (visibility_scope === 'student') {
            userQuery += " WHERE role = 'student'";
        } else if (visibility_scope === 'department' && department_id) {
            userQuery += " WHERE department_id = ?";
            queryParams.push(department_id);
        } else if (visibility_scope === 'all') {
            // No WHERE clause needed
        }

        const [users] = await db.execute(userQuery, queryParams);
        
        for (const user of users) {
            await sendNotification(user.id, `New Announcement: ${title}`, content.substring(0, 100) + '...');
        }
        
        res.status(201).json({ success: true, message: "Notice created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllNotices = async (req, res) => {
    try {
        const [notices] = await db.execute(`
            SELECT a.*, u.name as creator_name, d.name as department_name 
            FROM announcements a
            JOIN users u ON a.created_by = u.id
            LEFT JOIN departments d ON a.department_id = d.id
            ORDER BY a.publish_date DESC
        `);
        res.status(200).json({ success: true, data: notices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotice = async (req, res) => {
    try {
        await db.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// New functions for departments and semesters
export const getAllDepartments = async (req, res) => {
    try {
        const [departments] = await db.execute(`
            SELECT d.*, u.name as hod_name 
            FROM departments d
            LEFT JOIN users u ON d.hod_user_id = u.id
        `);
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { name, code, hod_user_id } = req.body;
        await db.execute(
            'INSERT INTO departments (name, code, hod_user_id) VALUES (?, ?, ?)',
            [name, code, hod_user_id && hod_user_id !== "" ? hod_user_id : null]
        );
        res.status(201).json({ success: true, message: "Department created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { name, code, hod_user_id } = req.body;
        await db.execute(
            'UPDATE departments SET name = ?, code = ?, hod_user_id = ? WHERE id = ?',
            [name, code, hod_user_id && hod_user_id !== "" ? hod_user_id : null, req.params.id]
        );
        res.status(200).json({ success: true, message: "Department updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        await db.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSemesters = async (req, res) => {
    try {
        const [semesters] = await db.execute('SELECT * FROM semesters ORDER BY academic_year DESC, semester_number ASC');
        res.status(200).json({ success: true, data: semesters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await db.execute(`
            SELECT s.*, d.name as department_name, sem.semester_number 
            FROM subjects s
            JOIN departments d ON s.department_id = d.id
            JOIN semesters sem ON s.semester_id = sem.id
        `);
        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSemester = async (req, res) => {
    try {
        const { semester_number, academic_year, is_active } = req.body;
        console.log('Creating semester:', { semester_number, academic_year, is_active });
        await db.execute(
            'INSERT INTO semesters (semester_number, academic_year, is_active) VALUES (?, ?, ?)',
            [semester_number, academic_year, is_active ? 1 : 0]
        );
        res.status(201).json({ success: true, message: "Semester created successfully" });
    } catch (error) {
        console.error('Error in createSemester:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSemester = async (req, res) => {
    try {
        const { semester_number, academic_year, is_active } = req.body;
        console.log('Updating semester:', { id: req.params.id, semester_number, academic_year, is_active });
        await db.execute(
            'UPDATE semesters SET semester_number = ?, academic_year = ?, is_active = ? WHERE id = ?',
            [semester_number, academic_year, is_active ? 1 : 0, req.params.id]
        );
        res.status(200).json({ success: true, message: "Semester updated successfully" });
    } catch (error) {
        console.error('Error in updateSemester:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSemester = async (req, res) => {
    try {
        await db.execute('DELETE FROM semesters WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: "Semester deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminProfile = async (req, res) => {
    try {
        const [admin] = await db.execute(`
            SELECT u.id, u.name, u.email, u.role, u.status, u.phone, u.dob, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ?
        `, [req.user.id]);
        res.status(200).json({ success: true, data: admin[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone, dob, designation } = req.body;
        await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, dob = ? WHERE id = ?',
            [name, email, phone || null, dob || null, req.user.id]
        );
        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
