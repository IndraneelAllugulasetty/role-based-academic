import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hodRoutes from './routes/hodRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import classroomRoutes from './routes/classroomRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/notifications', notificationRoutes);

// Shared Routes (Announcements, Events)
app.get('/api/announcements', async (req, res) => {
    try {
        const [announcements] = await db.execute('SELECT * FROM announcements ORDER BY publish_date DESC');
        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const [events] = await db.execute('SELECT * FROM events ORDER BY event_date ASC');
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default app;
