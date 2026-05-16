import db from '../config/db.js';

export const getTeacherDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id, department_id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
        
        const facultyId = faculty[0].id;
        
        // Classes count
        const [classes] = await db.execute('SELECT COUNT(*) as count FROM classrooms WHERE faculty_id = ?', [facultyId]);
        
        // Students count (unique students in teacher's classrooms)
        const [students] = await db.execute(`
            SELECT COUNT(DISTINCT s.id) as count
            FROM students s
            JOIN classrooms c ON s.department_id = c.department_id AND s.semester_id = c.semester_id
            WHERE c.faculty_id = ? AND (s.section = c.section OR c.section IS NULL)
        `, [facultyId]);

        // Pending attendance (classes today without attendance)
        // For simplicity, returning a mock number or a query if possible
        const pendingAttendance = 1; 

        res.status(200).json({ 
            success: true, 
            data: { 
                classesCount: classes[0].count, 
                studentsCount: students[0].count,
                pendingAttendance: pendingAttendance 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeacherProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute(`
            SELECT f.*, u.name, u.email, u.phone, u.dob, d.name as department_name
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            JOIN departments d ON f.department_id = d.id
            WHERE f.user_id = ?
        `, [userId]);

        if (faculty.length === 0) return res.status(404).json({ success: false, message: "Faculty not found" });
        res.status(200).json({ success: true, data: faculty[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTeacherProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { phone, dob } = req.body;
        await db.execute('UPDATE users SET phone = ?, dob = ? WHERE id = ?', [phone, dob, userId]);
        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeacherStudents = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
        
        const facultyId = faculty[0].id;
        const [students] = await db.execute(`
            SELECT DISTINCT u.name, u.email, s.student_roll_no, s.section, d.name as department_name, sem.semester_number
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN departments d ON s.department_id = d.id
            JOIN semesters sem ON s.semester_id = sem.id
            JOIN classrooms c ON s.department_id = c.department_id AND s.semester_id = c.semester_id
            WHERE c.faculty_id = ? AND (s.section = c.section OR c.section IS NULL)
        `, [facultyId]);

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeacherClasses = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        if (faculty.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
        
        const facultyId = faculty[0].id;
        const [classes] = await db.execute(`
            SELECT c.*, s.subject_name, s.subject_code, d.name as department_name, sem.semester_number
            FROM classrooms c
            JOIN subjects s ON c.subject_id = s.id
            JOIN departments d ON c.department_id = d.id
            JOIN semesters sem ON c.semester_id = sem.id
            WHERE c.faculty_id = ?
        `, [facultyId]);

        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { classroom_id, attendance_date, students } = req.body; // students: [{id, status}]
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        const facultyId = faculty[0].id;

        const [classroom] = await db.execute('SELECT subject_id FROM classrooms WHERE id = ?', [classroom_id]);
        const subjectId = classroom[0].subject_id;

        for (const student of students) {
            await db.execute(`
                INSERT INTO attendance (student_id, subject_id, faculty_id, attendance_date, status)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(student_id, subject_id, attendance_date) DO UPDATE SET status = excluded.status
            `, [student.id, subjectId, facultyId, attendance_date, student.status]);
        }

        res.status(201).json({ success: true, message: "Attendance marked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAttendanceRecords = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        const facultyId = faculty[0].id;

        const [records] = await db.execute(`
            SELECT a.*, u.name as student_name, s.subject_name
            FROM attendance a
            JOIN students st ON a.student_id = st.id
            JOIN users u ON st.user_id = u.id
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.faculty_id = ?
            ORDER BY a.attendance_date DESC
        `, [facultyId]);

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadMarks = async (req, res) => {
    try {
        const { classroom_id, assessment_type, max_marks, marks } = req.body; // marks: [{id, marks_obtained, remarks}]
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        const facultyId = faculty[0].id;

        const [classroom] = await db.execute('SELECT subject_id FROM classrooms WHERE id = ?', [classroom_id]);
        const subjectId = classroom[0].subject_id;

        for (const mark of marks) {
            await db.execute(`
                INSERT INTO internal_marks (student_id, subject_id, faculty_id, assessment_type, max_marks, marks_obtained, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id, subject_id, assessment_type) DO UPDATE SET 
                    marks_obtained = excluded.marks_obtained,
                    remarks = excluded.remarks,
                    max_marks = excluded.max_marks
            `, [mark.id, subjectId, facultyId, assessment_type, max_marks, mark.marks_obtained, mark.remarks]);
        }

        res.status(201).json({ success: true, message: "Marks uploaded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMarksRecords = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
        const facultyId = faculty[0].id;

        const [records] = await db.execute(`
            SELECT m.*, u.name as student_name, s.subject_name
            FROM internal_marks m
            JOIN students st ON m.student_id = st.id
            JOIN users u ON st.user_id = u.id
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.faculty_id = ?
            ORDER BY m.created_at DESC
        `, [facultyId]);

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTeacherNotices = async (req, res) => {
    try {
        const userId = req.user.id;
        const [faculty] = await db.execute('SELECT department_id FROM faculty WHERE user_id = ?', [userId]);
        const deptId = faculty[0].department_id;

        const [notices] = await db.execute(`
            SELECT a.*, u.name as creator_name
            FROM announcements a
            JOIN users u ON a.created_by = u.id
            WHERE a.visibility_scope = 'all' 
               OR a.visibility_scope = 'faculty'
               OR (a.visibility_scope = 'department' AND a.department_id = ?)
            ORDER BY a.publish_date DESC
        `, [deptId]);

        res.status(200).json({ success: true, data: notices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
