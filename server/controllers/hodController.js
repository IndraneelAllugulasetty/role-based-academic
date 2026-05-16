import db from '../config/db.js';
import { sendNotification } from './notificationController.js';

export const getDepartmentStats = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        const [students] = await db.execute('SELECT COUNT(*) as total FROM students WHERE department_id = ?', [deptId]);
        const [faculty] = await db.execute('SELECT COUNT(*) as total FROM faculty WHERE department_id = ?', [deptId]);
        const [subjects] = await db.execute('SELECT COUNT(*) as total FROM subjects WHERE department_id = ?', [deptId]);
        
        res.json({
            success: true,
            data: {
                students: students[0].total,
                faculty: faculty[0].total,
                subjects: subjects[0].total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentFaculty = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        if (!deptId) return res.status(400).json({ success: false, message: 'Department ID missing' });
        const [faculty] = await db.execute(`
            SELECT f.id, u.name, u.email, f.faculty_employee_id, f.designation
            FROM users u
            JOIN faculty f ON u.id = f.user_id
            WHERE f.department_id = ?
        `, [deptId]);
        res.json({ success: true, data: faculty });
    } catch (error) {
        console.error('Error in getDepartmentFaculty:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentStudents = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        if (!deptId) return res.status(400).json({ success: false, message: 'Department ID missing' });
        const [students] = await db.execute(`
            SELECT s.id, u.name, u.email, s.student_roll_no, sem.semester_number
            FROM users u
            JOIN students s ON u.id = s.user_id
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE s.department_id = ?
        `, [deptId]);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error in getDepartmentStudents:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const assignFacultySubject = async (req, res) => {
    const { faculty_id, subject_id } = req.body;
    const hodId = req.user.id;
    try {
        await db.execute(
            'INSERT OR REPLACE INTO faculty_subjects (faculty_id, subject_id, assigned_by_hod_id) VALUES (?, ?, ?)',
            [faculty_id, subject_id, hodId]
        );

        // Notify faculty
        const [faculty] = await db.execute('SELECT user_id FROM faculty WHERE id = ?', [faculty_id]);
        const [subject] = await db.execute('SELECT subject_name, subject_code FROM subjects WHERE id = ?', [subject_id]);
        
        if (faculty.length > 0 && subject.length > 0) {
            await sendNotification(
                faculty[0].user_id, 
                'New Subject Assignment', 
                `You have been assigned to subject: ${subject[0].subject_name} (${subject[0].subject_code})`
            );
        }

        res.json({ success: true, message: 'Faculty assigned to subject successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDepartmentSubjects = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        const [subjects] = await db.execute('SELECT * FROM subjects WHERE department_id = ?', [deptId]);
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentSemesters = async (req, res) => {
    try {
        const [semesters] = await db.execute('SELECT * FROM semesters WHERE is_active = 1');
        res.json({ success: true, data: semesters });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentInfo = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        const [dept] = await db.execute('SELECT * FROM departments WHERE id = ?', [deptId]);
        res.json({ success: true, data: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getFacultyAssignments = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        const [assignments] = await db.execute(`
            SELECT fs.id, u.name as faculty_name, f.faculty_employee_id, s.subject_name, s.subject_code
            FROM faculty_subjects fs
            JOIN faculty f ON fs.faculty_id = f.id
            JOIN users u ON f.user_id = u.id
            JOIN subjects s ON fs.subject_id = s.id
            WHERE f.department_id = ?
        `, [deptId]);
        res.json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDepartmentAnalytics = async (req, res) => {
    const deptId = req.user.department_id;
    try {
        const [students] = await db.execute('SELECT COUNT(*) as total FROM students WHERE department_id = ?', [deptId]);
        const [faculty] = await db.execute('SELECT COUNT(*) as total FROM faculty WHERE department_id = ?', [deptId]);
        const [classrooms] = await db.execute('SELECT COUNT(*) as total FROM classrooms WHERE department_id = ?', [deptId]);
        
        // Mocking some analytics data for visualization
        const data = {
            totalStudents: students[0].total,
            totalFaculty: faculty[0].total,
            activeClassrooms: classrooms[0].total,
            avgAttendance: 84,
            passPercentage: 89,
            attendanceTrend: [
                { month: 'Jan', attendance: 82 },
                { month: 'Feb', attendance: 85 },
                { month: 'Mar', attendance: 88 },
                { month: 'Apr', attendance: 84 },
                { month: 'May', attendance: 91 },
                { month: 'Jun', attendance: 87 },
            ],
            semesterDistribution: [
                { semester: 'Sem 1', students: 45 },
                { semester: 'Sem 2', students: 42 },
                { semester: 'Sem 3', students: 38 },
                { semester: 'Sem 4', students: 40 },
                { semester: 'Sem 5', students: 35 },
                { semester: 'Sem 6', students: 37 },
            ],
            subjectPerformance: [
                { name: 'Excellent', value: 30 },
                { name: 'Good', value: 40 },
                { name: 'Average', value: 20 },
                { name: 'Below Avg', value: 10 },
            ]
        };

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
