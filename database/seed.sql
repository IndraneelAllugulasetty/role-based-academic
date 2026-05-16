-- Seed Data for Academic Database Management System

-- 1. Departments
INSERT INTO departments (name, code) VALUES 
('Computer Science and Engineering', 'CSE'),
('Electronics and Communication Engineering', 'ECE');

-- 2. Users (Passwords are 'password123' hashed with bcrypt)
-- Admin
INSERT INTO users (name, email, password_hash, role, status) VALUES 
('Admin User', 'admin@college.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'admin', 'active');
-- HODs
INSERT INTO users (name, email, password_hash, role, status, department_id) VALUES 
('Dr. Ramesh HOD', 'hod_cse@college.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'hod', 'active', 1),
('Dr. Sunita HOD', 'hod_ece@college.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'hod', 'active', 2);
-- Faculty
INSERT INTO users (name, email, password_hash, role, status, department_id) VALUES 
('Prof. Amit', 'amit_faculty@college.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'faculty', 'active', 1),
('Prof. Priya', 'priya_faculty@college.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'faculty', 'active', 1);
-- Students
INSERT INTO users (name, email, password_hash, role, status, department_id) VALUES 
('Rahul Sharma', 'rahul@student.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'student', 'active', 1),
('Sneha Gupta', 'sneha@student.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'student', 'active', 1),
('Vikram Singh', 'vikram@student.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'student', 'active', 1),
('Ananya Rao', 'ananya@student.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'student', 'active', 1),
('Karthik M', 'karthik@student.edu', '$2b$10$k0v5NSXpQ.IWXI7mRQqQ2enjjHwq/VCKdxuxelYCor1F57lK29BXO', 'student', 'active', 1);

-- Update HOD user IDs in departments
UPDATE departments SET hod_user_id = 2 WHERE id = 1;
UPDATE departments SET hod_user_id = 3 WHERE id = 2;

-- 3. Semesters
INSERT INTO semesters (semester_number, academic_year, is_active) VALUES 
(1, '2023-24', 0),
(2, '2023-24', 1);

-- 4. Students Details
INSERT INTO students (user_id, student_roll_no, registration_no, department_id, semester_id, section, batch_year) VALUES 
(6, 'CSE2023001', 'REG2023001', 1, 2, 'A', '2023'),
(7, 'CSE2023002', 'REG2023002', 1, 2, 'A', '2023'),
(8, 'CSE2023003', 'REG2023003', 1, 2, 'A', '2023'),
(9, 'CSE2023004', 'REG2023004', 1, 2, 'A', '2023'),
(10, 'CSE2023005', 'REG2023005', 1, 2, 'A', '2023');

-- 5. Faculty Details
INSERT INTO faculty (user_id, faculty_employee_id, department_id, designation) VALUES 
(4, 'EMP001', 1, 'Assistant Professor'),
(5, 'EMP002', 1, 'Assistant Professor');

-- 6. Subjects
INSERT INTO subjects (subject_code, subject_name, department_id, semester_id, credits) VALUES 
('CS101', 'Data Structures', 1, 2, 4),
('CS102', 'Operating Systems', 1, 2, 4),
('CS103', 'Database Management', 1, 2, 3);

-- 7. Faculty Subjects
INSERT INTO faculty_subjects (faculty_id, subject_id, assigned_by_hod_id) VALUES 
(1, 1, 2),
(1, 2, 2),
(2, 3, 2);

-- 8. Announcements
INSERT INTO announcements (title, content, created_by, visibility_scope, publish_date) VALUES 
('Welcome to Semester 2', 'Classes for semester 2 will begin from next Monday.', 1, 'all', '2024-01-01'),
('CSE Department Meeting', 'All CSE students are requested to attend the meeting in Hall A.', 2, 'department', '2024-01-05');

-- 9. Events
INSERT INTO events (title, description, event_date, location, created_by, visibility_scope) VALUES 
('Tech Fest 2024', 'Annual technical festival of the college.', '2024-03-15', 'College Ground', 1, 'all'),
('Workshop on AI', 'Hands-on workshop on Artificial Intelligence.', '2024-02-20', 'Lab 1', 2, 'department');
