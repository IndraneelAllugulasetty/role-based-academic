import db from '../config/db.js';
import { analyzePerformance } from '../services/geminiService.js';

export const getStudentDashboardStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT id, semester_id, department_id, section FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;
        
        // Attendance
        const [attendance] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
            FROM attendance 
            WHERE student_id = ?
        `, [studentId]);
        
        const attendancePercent = attendance[0].total > 0 
            ? ((attendance[0].present / attendance[0].total) * 100).toFixed(1)
            : 0;

        // CGPA
        const [cgpaRecords] = await db.execute('SELECT cgpa FROM cgpa_records WHERE student_id = ?', [studentId]);
        const cgpa = cgpaRecords.length > 0 ? cgpaRecords[0].cgpa : "0.00";

        // Active Classrooms
        const [classrooms] = await db.execute(`
            SELECT COUNT(*) as count FROM classrooms 
            WHERE department_id = ? AND semester_id = ? AND (section = ? OR section IS NULL)
        `, [student[0].department_id, student[0].semester_id, student[0].section]);

        res.status(200).json({ 
            success: true, 
            data: { 
                attendance: attendancePercent, 
                cgpa: cgpa,
                activeClassrooms: classrooms[0].count
            } 
        });
    } catch (error) {
        console.error('Error in getStudentDashboardStats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute(`
            SELECT s.*, u.name, u.email, d.name as department_name, sem.semester_number
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN departments d ON s.department_id = d.id
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE s.user_id = ?
        `, [userId]);

        if (student.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({ success: true, data: student[0] });
    } catch (error) {
        console.error('Error in getStudentProfile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentAttendance = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;
        const [attendance] = await db.execute(`
            SELECT a.*, s.subject_name, s.subject_code
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.student_id = ?
            ORDER BY a.attendance_date DESC
        `, [studentId]);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error in getStudentAttendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentResults = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;
        const [results] = await db.execute(`
            SELECT r.*, s.subject_name, s.subject_code
            FROM semester_results r
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.student_id = ?
        `, [studentId]);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error in getStudentResults:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentSubjects = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT semester_id, department_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const { semester_id, department_id } = student[0];
        const [subjects] = await db.execute(`
            SELECT * FROM subjects 
            WHERE semester_id = ? AND department_id = ?
        `, [semester_id, department_id]);
        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error('Error in getStudentSubjects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentInternalMarks = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;
        const [marks] = await db.execute(`
            SELECT m.*, s.subject_name, s.subject_code
            FROM internal_marks m
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id = ?
        `, [studentId]);
        res.status(200).json({ success: true, data: marks });
    } catch (error) {
        console.error('Error in getStudentInternalMarks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentAnnouncements = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT department_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const deptId = student[0].department_id;
        const [announcements] = await db.execute(`
            SELECT a.*, u.name as creator_name
            FROM announcements a
            JOIN users u ON a.created_by = u.id
            WHERE a.visibility_scope = 'all' 
               OR a.visibility_scope = 'student'
               OR (a.visibility_scope = 'department' AND a.department_id = ?)
            ORDER BY a.publish_date DESC
        `, [deptId]);
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error in getStudentAnnouncements:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentEvents = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT department_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const deptId = student[0].department_id;
        const [events] = await db.execute(`
            SELECT e.*, u.name as creator_name
            FROM events e
            JOIN users u ON e.created_by = u.id
            WHERE e.visibility_scope = 'all' 
               OR e.visibility_scope = 'student'
               OR (e.visibility_scope = 'department' AND e.department_id = ?)
            ORDER BY e.event_date ASC
        `, [deptId]);
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error in getStudentEvents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentClassmates = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT semester_id, department_id, section FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const { semester_id, department_id, section } = student[0];
        const [classmates] = await db.execute(`
            SELECT u.name, u.email, s.student_roll_no, s.section
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.semester_id = ? AND s.department_id = ? AND (s.section = ? OR s.section IS NULL)
              AND u.id != ?
        `, [semester_id, department_id, section, userId]);
        res.status(200).json({ success: true, data: classmates });
    } catch (error) {
        console.error('Error in getStudentClassmates:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentFaculty = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT department_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const deptId = student[0].department_id;
        const [faculty] = await db.execute(`
            SELECT u.name, u.email, f.designation, f.faculty_employee_id
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            WHERE f.department_id = ?
        `, [deptId]);
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        console.error('Error in getStudentFaculty:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitFeedback = async (req, res) => {
    const userId = req.user.id;
    const { faculty_id, rating, comments, is_anonymous } = req.body;
    try {
        const [student] = await db.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;
        
        // Find faculty by employee_id to get their internal ID
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE faculty_employee_id = ?', [faculty_id]);
        if (faculty.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
        
        const facultyInternalId = faculty[0].id;

        await db.execute(`
            INSERT INTO feedback (student_id, faculty_id, category, rating, message, is_anonymous, status, created_at)
            VALUES (?, ?, 'faculty', ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
        `, [studentId, facultyInternalId, rating, comments, is_anonymous ? 1 : 0]);

        res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentAiAnalysis = async (req, res) => {
    const userId = req.user.id;
    try {
        const [student] = await db.execute('SELECT id, semester_id, department_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const studentId = student[0].id;

        // Fetch attendance data for analysis
        const [attendance] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
            FROM attendance 
            WHERE student_id = ?
        `, [studentId]);
        
        const attendancePercent = attendance[0].total > 0 
            ? ((attendance[0].present / attendance[0].total) * 100).toFixed(1)
            : 0;

        // Fetch marks data for analysis
        const [marks] = await db.execute(`
            SELECT AVG(marks_obtained) as avg_marks
            FROM internal_marks
            WHERE student_id = ?
        `, [studentId]);

        const avgMarks = marks[0].avg_marks || 0;

        // Fetch subject-wise details for more context
        const [subjectDetails] = await db.execute(`
            SELECT s.subject_name, 
                   COUNT(a.id) as total_classes,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_classes
            FROM subjects s
            LEFT JOIN attendance a ON s.id = a.subject_id AND a.student_id = ?
            WHERE s.semester_id = ? AND s.department_id = ?
            GROUP BY s.id
        `, [studentId, student[0].semester_id, student[0].department_id]);

        const studentData = {
            attendance_percentage: attendancePercent,
            average_marks: avgMarks,
            subject_details: subjectDetails
        };

        const analysis = await analyzePerformance(studentData);
        
        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        console.error('Error in getStudentAiAnalysis:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
