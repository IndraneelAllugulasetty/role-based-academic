import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Ensure at least one admin exists
        const [admins] = await db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        if (admins.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.execute(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['Default Admin', 'admin@college.edu', hashedPassword, 'admin']
            );
            console.log('Created default admin: admin@college.edu / admin123');
        }

        // Fetch user from DB
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = users[0];
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Fetch role-specific details for the login response
        if (user.role === 'student') {
            const [students] = await db.execute('SELECT id as student_id, section, semester_id FROM students WHERE user_id = ?', [user.id]);
            if (students.length > 0) Object.assign(user, students[0]);
        } else if (user.role === 'faculty' || user.role === 'hod') {
            const [faculty] = await db.execute('SELECT id as faculty_id, designation FROM faculty WHERE user_id = ?', [user.id]);
            if (faculty.length > 0) Object.assign(user, faculty[0]);
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, department_id: user.department_id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        // Remove password hash from response
        delete user.password_hash;

        res.status(200).json({
            success: true,
            data: {
                token,
                user
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;
        
        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'student', department_id || null]
        );
        
        res.status(201).json({ success: true, message: "User registered successfully", id: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.execute(`
            SELECT u.id, u.name, u.email, u.role, u.department_id, u.status, u.phone, u.dob, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = users[0];

        // Fetch role-specific details
        if (user.role === 'student') {
            const [students] = await db.execute(`
                SELECT s.student_roll_no, s.registration_no, s.section, s.batch_year, 
                       sem.semester_number 
                FROM students s
                JOIN semesters sem ON s.semester_id = sem.id
                WHERE s.user_id = ?
            `, [userId]);
            if (students.length > 0) {
                Object.assign(user, students[0]);
            }
        } else if (user.role === 'faculty' || user.role === 'hod') {
            const [faculty] = await db.execute('SELECT id as faculty_id, faculty_employee_id, designation FROM faculty WHERE user_id = ?', [userId]);
            if (faculty.length > 0) {
                Object.assign(user, faculty[0]);
            }
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyToken = async (req, res) => {
    res.status(200).json({ success: true, valid: true });
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, dob, designation } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

        // Update basic user info
        await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, dob = ? WHERE id = ?',
            [name, email, phone || null, dob || null, userId]
        );

        // Update role-specific info
        if (role === 'faculty' || role === 'hod') {
            await db.execute(
                'UPDATE faculty SET designation = ? WHERE user_id = ?',
                [designation || null, userId]
            );
        }

        // Fetch updated user
        const [updatedUsers] = await db.execute(`
            SELECT u.id, u.name, u.email, u.role, u.department_id, u.phone, u.dob, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ?
        `, [userId]);
        
        res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully",
            data: updatedUsers[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
