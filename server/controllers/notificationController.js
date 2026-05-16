import db from '../config/db.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [userId]
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await db.execute(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendNotification = async (userId, title, message) => {
    try {
        await db.execute(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [userId, title, message]
        );
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
};
