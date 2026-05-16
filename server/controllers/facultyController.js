import db from '../config/db.js';
import { sendNotification } from './notificationController.js';

export const getAssignedSubjects = async (req, res) => {
    const userId = req.user.id;
    try {
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) {
            // If not in faculty table, check if HOD
            if (req.user.role === 'hod') {
                const [subjects] = await db.execute('SELECT * FROM subjects WHERE department_id = ?', [req.user.department_id]);
                return res.json({ success: true, data: subjects });
            }
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }
        
        const facultyId = faculty[0].id;
        const [subjects] = await db.execute(`
            SELECT s.id, s.subject_code, s.subject_name, s.credits, sem.semester_number, sem.id as semester_id,
                   c.id as classroom_id
            FROM subjects s
            JOIN faculty_subjects fs ON s.id = fs.subject_id
            JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN classrooms c ON s.id = c.subject_id AND c.faculty_id = ?
            WHERE fs.faculty_id = ?
        `, [facultyId, facultyId]);
        res.json({ success: true, data: subjects });
    } catch (error) {
        console.error('Error in getAssignedSubjects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentSubjects = async (req, res) => {
    try {
        const deptId = req.user.department_id;
        const [subjects] = await db.execute(`
            SELECT s.*, sem.semester_number 
            FROM subjects s
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE s.department_id = ?
        `, [deptId]);
        res.json({ success: true, data: subjects });
    } catch (error) {
        console.error('Error in getDepartmentSubjects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    const { section } = req.query;
    try {
        const [subject] = await db.execute('SELECT semester_id, department_id FROM subjects WHERE id = ?', [subjectId]);
        if (subject.length === 0) return res.status(404).json({ success: false, message: 'Subject not found' });
        
        const { semester_id, department_id } = subject[0];
        let query = `
            SELECT s.id, u.name, s.student_roll_no, s.section
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.semester_id = ? AND s.department_id = ?
        `;
        const params = [semester_id, department_id];

        if (section && section !== 'All') {
            query += ' AND s.section = ?';
            params.push(section);
        }

        const [students] = await db.execute(query, params);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error in getStudentsBySubject:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const addSubject = async (req, res) => {
    const userId = req.user.id;
    const { subject_name, subject_code, semester_id, credits } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [faculty] = await connection.execute('SELECT id, department_id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) throw new Error('Faculty not found');
        const facultyId = faculty[0].id;
        const departmentId = faculty[0].department_id;

        // 1. Create subject
        const [subjectResult] = await connection.execute(
            'INSERT INTO subjects (subject_name, subject_code, department_id, semester_id, credits) VALUES (?, ?, ?, ?, ?)',
            [subject_name, subject_code, departmentId, semester_id, credits]
        );
        const subjectId = subjectResult.insertId;

        // 2. Assign to self
        await connection.execute(
            'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)',
            [facultyId, subjectId]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Subject added and assigned successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const markAttendance = async (req, res) => {
    const { subject_id, attendance_date, attendance_data } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [faculty] = await connection.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) throw new Error('Faculty record not found');
        const facultyId = faculty[0].id;
        
        for (const record of attendance_data) {
            await connection.execute(
                'INSERT INTO attendance (student_id, subject_id, faculty_id, attendance_date, status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(student_id, subject_id, attendance_date) DO UPDATE SET status = excluded.status',
                [record.student_id, subject_id, facultyId, attendance_date, record.status]
            );
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const enterInternalMarks = async (req, res) => {
    const { subject_id, assessment_type, max_marks, marks_data } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [faculty] = await connection.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) throw new Error('Faculty record not found');
        const facultyId = faculty[0].id;
        
        const [subject] = await connection.execute('SELECT subject_name FROM subjects WHERE id = ?', [subject_id]);
        const subjectName = subject[0]?.subject_name || 'Subject';

        for (const record of marks_data) {
            await connection.execute(
                'INSERT INTO internal_marks (student_id, subject_id, faculty_id, assessment_type, max_marks, marks_obtained) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(student_id, subject_id, assessment_type) DO UPDATE SET marks_obtained = excluded.marks_obtained, max_marks = excluded.max_marks',
                [record.student_id, subject_id, facultyId, assessment_type, max_marks, record.marks_obtained]
            );

            // Notify student
            const [student] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [record.student_id]);
            if (student.length > 0) {
                await sendNotification(
                    student[0].user_id,
                    'Marks Posted',
                    `Your internal marks for ${subjectName} (${assessment_type}) have been posted: ${record.marks_obtained}/${max_marks}`
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Marks entered successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
