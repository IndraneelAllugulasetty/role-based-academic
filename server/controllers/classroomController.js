import db from '../config/db.js';
import { sendNotification } from './notificationController.js';

// Create a new classroom (Admin/HOD only)
export const createClassroom = async (req, res) => {
    try {
        const { name, subject_id, faculty_id, department_id, semester_id, section } = req.body;
        const [result] = await db.execute(
            'INSERT INTO classrooms (name, subject_id, faculty_id, department_id, semester_id, section) VALUES (?, ?, ?, ?, ?, ?)',
            [name, subject_id, faculty_id, department_id, semester_id, section]
        );
        res.status(201).json({ success: true, message: "Classroom created successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get classrooms for a student
export const getStudentClassrooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const [students] = await db.execute('SELECT department_id, semester_id, section FROM students WHERE user_id = ?', [userId]);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: "Student record not found" });
        }

        const { department_id, semester_id, section } = students[0];

        const [classrooms] = await db.execute(`
            SELECT c.*, s.subject_name, s.subject_code, u.name as faculty_name
            FROM classrooms c
            JOIN subjects s ON c.subject_id = s.id
            JOIN faculty f ON c.faculty_id = f.id
            JOIN users u ON f.user_id = u.id
            WHERE c.department_id = ? AND c.semester_id = ? AND (c.section = ? OR c.section IS NULL)
        `, [department_id, semester_id, section]);

        res.status(200).json({ success: true, data: classrooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all classrooms (Admin only)
export const getAllClassrooms = async (req, res) => {
    try {
        const [classrooms] = await db.execute(`
            SELECT c.*, s.subject_name, s.subject_code, d.name as department_name, sem.semester_number, u.name as faculty_name
            FROM classrooms c
            JOIN subjects s ON c.subject_id = s.id
            JOIN departments d ON c.department_id = d.id
            JOIN semesters sem ON c.semester_id = sem.id
            JOIN faculty f ON c.faculty_id = f.id
            JOIN users u ON f.user_id = u.id
        `);
        res.status(200).json({ success: true, data: classrooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get department classrooms (HOD only)
export const getDepartmentClassrooms = async (req, res) => {
    try {
        const deptId = req.user.department_id;
        const [classrooms] = await db.execute(`
            SELECT c.*, s.subject_name, s.subject_code, d.name as department_name, sem.semester_number, u.name as faculty_name
            FROM classrooms c
            JOIN subjects s ON c.subject_id = s.id
            JOIN departments d ON c.department_id = d.id
            JOIN semesters sem ON c.semester_id = sem.id
            JOIN faculty f ON c.faculty_id = f.id
            JOIN users u ON f.user_id = u.id
            WHERE c.department_id = ?
        `, [deptId]);
        res.status(200).json({ success: true, data: classrooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getFacultyClassrooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        
        if (faculty.length === 0) {
            return res.status(404).json({ success: false, message: "Faculty record not found" });
        }

        const facultyId = faculty[0].id;

        const [classrooms] = await db.execute(`
            SELECT c.*, s.subject_name, s.subject_code, d.name as department_name, sem.semester_number
            FROM classrooms c
            JOIN subjects s ON c.subject_id = s.id
            JOIN departments d ON c.department_id = d.id
            JOIN semesters sem ON c.semester_id = sem.id
            WHERE c.faculty_id = ?
        `, [facultyId]);

        res.status(200).json({ success: true, data: classrooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get classroom details (materials and assignments)
export const getClassroomDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [materials] = await db.execute('SELECT * FROM classroom_materials WHERE classroom_id = ? ORDER BY created_at DESC', [id]);
        const [assignments] = await db.execute('SELECT * FROM classroom_assignments WHERE classroom_id = ? ORDER BY created_at DESC', [id]);

        res.status(200).json({ 
            success: true, 
            data: { materials, assignments } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Post material (Faculty only)
export const postMaterial = async (req, res) => {
    try {
        const { classroom_id, title, description, file_url, file_type } = req.body;
        const posted_by = req.user.id;

        await db.execute(
            'INSERT INTO classroom_materials (classroom_id, title, description, file_url, file_type, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
            [classroom_id, title, description, file_url, file_type, posted_by]
        );

        // Notify students in this classroom
        const [classroom] = await db.execute('SELECT name, department_id, semester_id, section FROM classrooms WHERE id = ?', [classroom_id]);
        if (classroom.length > 0) {
            const { name, department_id, semester_id, section } = classroom[0];
            let studentQuery = 'SELECT user_id FROM students WHERE department_id = ? AND semester_id = ?';
            const params = [department_id, semester_id];
            if (section) {
                studentQuery += ' AND section = ?';
                params.push(section);
            }
            const [students] = await db.execute(studentQuery, params);
            for (const student of students) {
                await sendNotification(student.user_id, `New Material in ${name}`, `New material posted: ${title}`);
            }
        }

        res.status(201).json({ success: true, message: "Material posted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Post assignment (Faculty only)
export const postAssignment = async (req, res) => {
    try {
        const { classroom_id, title, description, due_date, max_marks, file_url } = req.body;
        const posted_by = req.user.id;

        await db.execute(
            'INSERT INTO classroom_assignments (classroom_id, title, description, due_date, max_marks, file_url, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [classroom_id, title, description, due_date, max_marks, file_url, posted_by]
        );

        // Notify students in this classroom
        const [classroom] = await db.execute('SELECT name, department_id, semester_id, section FROM classrooms WHERE id = ?', [classroom_id]);
        if (classroom.length > 0) {
            const { name, department_id, semester_id, section } = classroom[0];
            let studentQuery = 'SELECT user_id FROM students WHERE department_id = ? AND semester_id = ?';
            const params = [department_id, semester_id];
            if (section) {
                studentQuery += ' AND section = ?';
                params.push(section);
            }
            const [students] = await db.execute(studentQuery, params);
            for (const student of students) {
                await sendNotification(student.user_id, `New Assignment in ${name}`, `New assignment posted: ${title}. Due: ${due_date}`);
            }
        }

        res.status(201).json({ success: true, message: "Assignment posted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit assignment (Student only)
export const submitAssignment = async (req, res) => {
    try {
        const { assignment_id, submission_text, file_url } = req.body;
        const userId = req.user.id;
        const [students] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: "Student record not found" });
        }

        const studentId = students[0].id;

        await db.execute(
            'INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_url) VALUES (?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET submission_text = excluded.submission_text, file_url = excluded.file_url, submitted_at = CURRENT_TIMESTAMP',
            [assignment_id, studentId, submission_text, file_url]
        );

        res.status(200).json({ success: true, message: "Assignment submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClassroomStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const [classroom] = await db.execute('SELECT department_id, semester_id, section FROM classrooms WHERE id = ?', [id]);
        if (classroom.length === 0) return res.status(404).json({ success: false, message: "Classroom not found" });
        
        const { department_id, semester_id, section } = classroom[0];
        let query = `
            SELECT s.id, u.name, u.email, s.student_roll_no, s.section
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.department_id = ? AND s.semester_id = ?
        `;
        const params = [department_id, semester_id];
        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }
        const [students] = await db.execute(query, params);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClassroomAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        if (role === 'student') {
            // Student specific analytics for this classroom
            const [student] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (student.length === 0) return res.status(404).json({ success: false, message: "Student record not found" });
            const studentId = student[0].id;
            
            const [attendance] = await db.execute(`
                SELECT 
                    COUNT(*) as total_classes,
                    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_classes
                FROM attendance
                WHERE student_id = ? AND subject_id = (SELECT subject_id FROM classrooms WHERE id = ?)
            `, [studentId, id]);

            const [marks] = await db.execute(`
                SELECT assessment_type, marks_obtained, max_marks
                FROM internal_marks
                WHERE student_id = ? AND subject_id = (SELECT subject_id FROM classrooms WHERE id = ?)
            `, [studentId, id]);

            const stats = {
                attendancePercentage: attendance[0].total_classes > 0 ? (attendance[0].present_classes / attendance[0].total_classes * 100).toFixed(1) : 0,
                totalClasses: attendance[0].total_classes,
                presentClasses: attendance[0].present_classes,
                marks: marks
            };

            return res.status(200).json({ success: true, data: stats });
        }

        // Faculty/HOD/Admin analytics for this classroom
        const [attendance] = await db.execute(`
            SELECT attendance_date, COUNT(*) as total, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
            FROM attendance
            WHERE subject_id = (SELECT subject_id FROM classrooms WHERE id = ?)
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
            LIMIT 10
        `, [id]);

        const data = {
            avgAttendance: 85,
            submissionRate: 78,
            attendanceTrend: attendance.map(a => ({
                date: new Date(a.attendance_date).toLocaleDateString(),
                percentage: (a.present / a.total * 100).toFixed(1)
            })).reverse()
        };
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
