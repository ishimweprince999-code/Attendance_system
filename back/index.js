const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_attendance',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Initialize Database Connection
const initializeDatabase = async () => {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        connection.release();
        
        // Initialize database tables
        await initializeTables();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};
// Initialize Database Tables
const initializeTables = async () => {
    const createTablesSQL = `
        -- Students table
        CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            card_id VARCHAR(50) UNIQUE NOT NULL,
            parent_phone VARCHAR(20),
            parent_email VARCHAR(100),
            class VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        -- Attendance records table
        CREATE TABLE IF NOT EXISTS attendance (
            id VARCHAR(36) PRIMARY KEY,
            student_id VARCHAR(36) NOT NULL,
            student_name VARCHAR(100) NOT NULL,
            card_id VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            timestamp TIME NOT NULL,
            status ENUM('present', 'absent') NOT NULL,
            auto_marked BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            INDEX idx_date (date),
            INDEX idx_student_date (student_id, date)
        );

        -- Notifications table
        CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(36) PRIMARY KEY,
            student_id VARCHAR(36) NOT NULL,
            student_name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            message TEXT,
            status ENUM('pending', 'sent') DEFAULT 'pending',
            consecutive_absent_days INT DEFAULT 0,
            sent_date TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );

        -- Daily reports table
        CREATE TABLE IF NOT EXISTS daily_reports (
            id VARCHAR(36) PRIMARY KEY,
            date DATE NOT NULL,
            day_number INT NOT NULL,
            total_students INT NOT NULL,
            present_count INT NOT NULL,
            absent_count INT NOT NULL,
            attendance_rate INT NOT NULL,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_date (date)
        );

        -- System settings table
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value TEXT,
            description VARCHAR(255),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

    try {
        // Split and execute each table creation
        const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.execute(statement + ';');
            }
        }

        // Insert default settings
        await pool.execute(`
            INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
            ('day_duration', '120', 'Day duration in minutes (2 minutes for prototype)'),
            ('attendance_time', '60', 'Attendance time in seconds (1 minute for prototype)'),
            ('current_day', '1', 'Current day number'),
            ('last_day_reset', NOW(), 'Last day reset timestamp')
        `);

        // Insert sample students if none exist
        const [existingStudents] = await pool.execute('SELECT COUNT(*) as count FROM students');
        if (existingStudents[0].count === 0) {
            await pool.execute(`
                INSERT INTO students (id, name, card_id, parent_phone, parent_email, class) VALUES
                (UUID(), 'John Doe', 'CARD001', '+1234567890', 'parent1@email.com', 'Grade 5A'),
                (UUID(), 'Jane Smith', 'CARD002', '+1234567891', 'parent2@email.com', 'Grade 5B'),
                (UUID(), 'Mike Johnson', 'CARD003', '+1234567892', 'parent3@email.com', 'Grade 5A')
            `);
            console.log('✅ Sample students inserted');
        }

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing tables:', error.message);
    }
};

// Utility Functions
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().split(' ')[0];

// Timer Management (In-memory for prototype)
const timerManager = {
    timers: new Map(),
    dayTimer: null,
    DAY_DURATION: 2 * 60 * 1000, // 2 minutes
    ATTENDANCE_TIME: 1 * 60 * 1000, // 1 minute

    async startDaySystem() {
        console.log('🔄 Starting day system...');
        await this.startNewDay();
    },

    async startNewDay() {
        this.clearAllTimers();
        console.log('🏁 Starting new day timers...');

        // Get all students and start timers
        const [students] = await pool.execute('SELECT * FROM students');
        
        students.forEach(student => {
            this.startAbsenceTimer(student);
        });

        console.log(`⏰ Started ${students.length} absence timers`);

        // Set timer for next day
        this.dayTimer = setTimeout(() => {
            console.log('🔄 Day completed! Starting new day...');
            this.startNewDay();
        }, this.DAY_DURATION);
    },

    startAbsenceTimer(student) {
        if (this.timers.has(student.id)) {
            clearTimeout(this.timers.get(student.id));
        }

        const timer = setTimeout(async () => {
            try {
                console.log(`⏰ Timer expired for ${student.name}, marking absent...`);
                
                const today = getCurrentDate();
                const [existing] = await pool.execute(
                    'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
                    [student.id, today]
                );

                if (existing.length === 0) {
                    const attendanceId = generateUUID();
                    await pool.execute(
                        `INSERT INTO attendance (id, student_id, student_name, card_id, date, timestamp, status, auto_marked) 
                         VALUES (?, ?, ?, ?, ?, ?, 'absent', TRUE)`,
                        [attendanceId, student.id, student.name, student.card_id, today, getCurrentTime()]
                    );

                    // Check for consecutive absences
                    const consecutiveAbsences = await this.checkConsecutiveAbsences(student.id);
                    if (consecutiveAbsences >= 3) {
                        const notificationId = generateUUID();
                        await pool.execute(
                            `INSERT INTO notifications (id, student_id, student_name, type, message, consecutive_absent_days, status) 
                             VALUES (?, ?, ?, 'consecutive_absence', ?, ?, 'pending')`,
                            [notificationId, student.id, student.name, 
                             `Alert: Your child ${student.name} has been absent for ${consecutiveAbsences} consecutive days.`,
                             consecutiveAbsences]
                        );
                    }
                }

                this.timers.delete(student.id);
            } catch (error) {
                console.error(`Error marking student absent: ${error.message}`);
            }
        }, this.ATTENDANCE_TIME);

        this.timers.set(student.id, timer);
    },

    clearStudentTimer(studentId) {
        if (this.timers.has(studentId)) {
            clearTimeout(this.timers.get(studentId));
            this.timers.delete(studentId);
        }
    },

    clearAllTimers() {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
        if (this.dayTimer) {
            clearTimeout(this.dayTimer);
            this.dayTimer = null;
        }
    },

    async checkConsecutiveAbsences(studentId) {
        const [rows] = await pool.execute(
            `SELECT date, status 
             FROM attendance 
             WHERE student_id = ? 
             AND date >= DATE_SUB(CURDATE(), INTERVAL 5 DAY) 
             ORDER BY date DESC`,
            [studentId]
        );
        
        let consecutiveAbsences = 0;
        const today = getCurrentDate();
        let currentDate = new Date(today);
        
        for (let i = 0; i < 5; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const record = rows.find(r => r.date.toISOString().split('T')[0] === dateStr);
            
            if (record && record.status === 'absent') {
                consecutiveAbsences++;
            } else if (record && record.status === 'present') {
                break;
            } else {
                consecutiveAbsences++;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return consecutiveAbsences;
    },

    getActiveTimersCount() {
        return this.timers.size;
    }
};

// ==================== ROUTES ====================

// Students Routes
app.get('/api/students', async (req, res) => {
    try {
        const [students] = await pool.execute('SELECT * FROM students ORDER BY name');
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { name, cardId, parentPhone, parentEmail, class: studentClass } = req.body;
        
        if (!name || !cardId || !studentClass) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, card ID, and class are required' 
            });
        }

        // Check if card ID exists
        const [existing] = await pool.execute(
            'SELECT id FROM students WHERE card_id = ?',
            [cardId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Card ID ${cardId} is already assigned to another student` 
            });
        }

        const studentId = generateUUID();
        await pool.execute(
            `INSERT INTO students (id, name, card_id, parent_phone, parent_email, class) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [studentId, name, cardId, parentPhone, parentEmail, studentClass]
        );

        // Start timer for new student
        const [newStudent] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
        timerManager.startAbsenceTimer(newStudent[0]);

        res.json({ 
            success: true, 
            message: 'Student added successfully',
            data: { id: studentId, ...req.body }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cardId, parentPhone, parentEmail, class: studentClass } = req.body;

        const [existingStudent] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        if (existingStudent.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Check if new card ID conflicts with other students
        if (cardId && cardId !== existingStudent[0].card_id) {
            const [conflict] = await pool.execute(
                'SELECT id FROM students WHERE card_id = ? AND id != ?',
                [cardId, id]
            );

            if (conflict.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Card ID ${cardId} is already assigned to another student` 
                });
            }
        }

        await pool.execute(
            `UPDATE students 
             SET name = ?, card_id = ?, parent_phone = ?, parent_email = ?, class = ? 
             WHERE id = ?`,
            [name, cardId, parentPhone, parentEmail, studentClass, id]
        );

        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM students WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Clear timer for deleted student
        timerManager.clearStudentTimer(id);

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Attendance Routes
app.post('/api/attendance/record', async (req, res) => {
    try {
        const { cardId } = req.body;

        if (!cardId) {
            return res.status(400).json({ success: false, message: 'Card ID is required' });
        }

        // Find student by card ID
        const [students] = await pool.execute(
            'SELECT * FROM students WHERE card_id = ?',
            [cardId]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found with this card ID' });
        }

        const student = students[0];
        const today = getCurrentDate();

        // Check if already attended today
        const [existing] = await pool.execute(
            'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
            [student.id, today]
        );

        if (existing.length > 0) {
            return res.json({ 
                success: false, 
                message: `Attendance already recorded today for ${student.name}` 
            });
        }

        // Record attendance
        const attendanceId = generateUUID();
        await pool.execute(
            `INSERT INTO attendance (id, student_id, student_name, card_id, date, timestamp, status, auto_marked) 
             VALUES (?, ?, ?, ?, ?, ?, 'present', FALSE)`,
            [attendanceId, student.id, student.name, student.card_id, today, getCurrentTime()]
        );

        // Clear student timer
        timerManager.clearStudentTimer(student.id);

        // Check consecutive absences
        const consecutiveAbsences = await timerManager.checkConsecutiveAbsences(student.id);

        res.json({ 
            success: true, 
            message: `Attendance recorded for ${student.name}`,
            student: student
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/attendance/today', async (req, res) => {
    try {
        const today = getCurrentDate();
        const [attendance] = await pool.execute(
            `SELECT a.*, s.class 
             FROM attendance a 
             JOIN students s ON a.student_id = s.id 
             WHERE a.date = ? 
             ORDER BY a.timestamp DESC`,
            [today]
        );
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/attendance/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 15;
        const [attendance] = await pool.execute(
            `SELECT a.*, s.class 
             FROM attendance a 
             JOIN students s ON a.student_id = s.id 
             ORDER BY a.date DESC, a.timestamp DESC 
             LIMIT ?`,
            [limit]
        );
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard Routes
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = getCurrentDate();
        
        const [totalStudents] = await pool.execute('SELECT COUNT(*) as count FROM students');
        const [todayAttendance] = await pool.execute(
            'SELECT status, COUNT(*) as count FROM attendance WHERE date = ? GROUP BY status',
            [today]
        );
        
        const [pendingNotifications] = await pool.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE status = "pending"'
        );
        
        const activeTimers = timerManager.getActiveTimersCount();
        
        const stats = {
            totalStudents: totalStudents[0].count,
            presentToday: 0,
            absentToday: 0,
            pendingNotifications: pendingNotifications[0].count,
            pendingAbsenceTimers: activeTimers
        };
        
        todayAttendance.forEach(record => {
            if (record.status === 'present') {
                stats.presentToday = record.count;
            } else if (record.status === 'absent') {
                stats.absentToday = record.count;
            }
        });
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Notifications Routes
app.get('/api/notifications', async (req, res) => {
    try {
        const [notifications] = await pool.execute(
            `SELECT n.*, s.parent_phone, s.parent_email, s.class 
             FROM notifications n 
             JOIN students s ON n.student_id = s.id 
             ORDER BY n.created_at DESC`
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/notifications/:id/send', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'UPDATE notifications SET status = "sent", sent_date = NOW() WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Here you would integrate with actual SMS/Email service
        // For now, we'll just log it
        console.log('📧 Notification sent:', id);

        res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reports Routes
app.get('/api/reports', async (req, res) => {
    try {
        const [reports] = await pool.execute(
            'SELECT * FROM daily_reports ORDER BY date DESC'
        );
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/reports/generate', async (req, res) => {
    try {
        const today = getCurrentDate();
        
        // Check if report already exists for today
        const [existing] = await pool.execute(
            'SELECT id FROM daily_reports WHERE date = ?',
            [today]
        );

        if (existing.length > 0) {
            return res.json({ success: false, message: 'Report already exists for today' });
        }

        // Get attendance data
        const [attendanceData] = await pool.execute(
            'SELECT status, COUNT(*) as count FROM attendance WHERE date = ? GROUP BY status',
            [today]
        );
        
        const [totalStudents] = await pool.execute('SELECT COUNT(*) as count FROM students');
        const [lastReport] = await pool.execute(
            'SELECT day_number FROM daily_reports ORDER BY day_number DESC LIMIT 1'
        );
        
        const presentCount = attendanceData.find(r => r.status === 'present')?.count || 0;
        const absentCount = attendanceData.find(r => r.status === 'absent')?.count || 0;
        const attendanceRate = totalStudents[0].count > 0 ? 
            Math.round((presentCount / totalStudents[0].count) * 100) : 0;
        const dayNumber = lastReport.length > 0 ? lastReport[0].day_number + 1 : 1;

        const reportId = generateUUID();
        await pool.execute(
            `INSERT INTO daily_reports (id, date, day_number, total_students, present_count, absent_count, attendance_rate) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [reportId, today, dayNumber, totalStudents[0].count, presentCount, absentCount, attendanceRate]
        );

        res.json({ success: true, message: 'Report generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// System Routes
app.post('/api/system/new-day', async (req, res) => {
    try {
        // Generate report for current day first
        const today = getCurrentDate();
        const [attendanceData] = await pool.execute(
            'SELECT COUNT(*) as count FROM attendance WHERE date = ?',
            [today]
        );

        if (attendanceData[0].count > 0) {
            // Auto-generate report if there's attendance data
            await pool.execute(
                `INSERT IGNORE INTO daily_reports (id, date, day_number, total_students, present_count, absent_count, attendance_rate) 
                 SELECT UUID(), ?, COALESCE(MAX(day_number), 0) + 1, 
                        (SELECT COUNT(*) FROM students),
                        (SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'present'),
                        (SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'absent'),
                        ROUND((SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'present') / 
                              (SELECT COUNT(*) FROM students) * 100)
                 FROM daily_reports`,
                [today, today, today, today]
            );
        }

        // Start new day
        await timerManager.startNewDay();

        res.json({ success: true, message: 'New day started successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Manual Absence Route
app.post('/api/attendance/manual-absent/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const [students] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];
        const today = getCurrentDate();

        const [existing] = await pool.execute(
            'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
            [student.id, today]
        );

        if (existing.length > 0) {
            return res.json({ 
                success: false, 
                message: `Attendance already recorded for ${student.name} today` 
            });
        }

        const attendanceId = generateUUID();
        await pool.execute(
            `INSERT INTO attendance (id, student_id, student_name, card_id, date, timestamp, status, auto_marked) 
             VALUES (?, ?, ?, ?, ?, ?, 'absent', FALSE)`,
            [attendanceId, student.id, student.name, student.card_id, today, getCurrentTime()]
        );

        // Clear timer
        timerManager.clearStudentTimer(student.id);

        res.json({ success: true, message: `${student.name} marked as absent` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running', 
        timestamp: new Date().toISOString() 
    });
});

// Add this route to your backend server.js

// Get attendance by date
app.get('/api/attendance/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    const [attendance] = await pool.execute(
      `SELECT a.*, s.class 
       FROM attendance a 
       JOIN students s ON a.student_id = s.id 
       WHERE a.date = ? 
       ORDER BY a.timestamp DESC`,
      [date]
    );

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server
const startServer = async () => {
    await initializeDatabase();
    await timerManager.startDaySystem();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 School Attendance System Backend Ready`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server...');
    timerManager.clearAllTimers();
    if (pool) {
        await pool.end();
    }
    process.exit(0);
});

startServer();