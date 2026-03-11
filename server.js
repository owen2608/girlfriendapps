const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'pinky-love-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '.')));

// Initialize SQLite database
const db = new sqlite3.Database('./daily_space.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create database tables
function initializeDatabase() {
    // Users table (simple authentication)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Requests table
    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Daily feelings table
    db.run(`CREATE TABLE IF NOT EXISTS feelings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL,
        feeling TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Availability table
    db.run(`CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL,
        status TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Bucket list table
    db.run(`CREATE TABLE IF NOT EXISTS bucket_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('Database tables initialized');
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// AUTHENTICATION ROUTES
app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body);
    const { password } = req.body;

    if (password === 'pinky') {
        req.session.authenticated = true;
        req.session.userId = 1; // Simple user ID for now
        console.log('Login successful, session:', req.session);
        res.json({ success: true, message: 'Login successful' });
    } else {
        console.log('Login failed - invalid password');
        res.status(401).json({ error: 'Invalid password' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Logout failed' });
        } else {
            res.json({ success: true, message: 'Logout successful' });
        }
    });
});

app.get('/api/check-auth', (req, res) => {
    res.json({ authenticated: req.session.authenticated || false });
});

// REQUESTS ROUTES
app.get('/api/requests', requireAuth, (req, res) => {
    db.all('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC',
           [req.session.userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/requests', requireAuth, (req, res) => {
    const { text } = req.body;
    db.run('INSERT INTO requests (user_id, text) VALUES (?, ?)',
           [req.session.userId, text], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, text, completed: false });
        }
    });
});

app.put('/api/requests/:id', requireAuth, (req, res) => {
    const { completed } = req.body;
    db.run('UPDATE requests SET completed = ? WHERE id = ? AND user_id = ?',
           [completed ? 1 : 0, req.params.id, req.session.userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.delete('/api/requests/:id', requireAuth, (req, res) => {
    db.run('DELETE FROM requests WHERE id = ? AND user_id = ?',
           [req.params.id, req.session.userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// FEELINGS ROUTES
app.get('/api/feelings/:date', requireAuth, (req, res) => {
    db.get('SELECT * FROM feelings WHERE user_id = ? AND date = ?',
           [req.session.userId, req.params.date], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row || null);
        }
    });
});

app.post('/api/feelings', requireAuth, (req, res) => {
    const { date, feeling, note } = req.body;
    db.run(`INSERT OR REPLACE INTO feelings (user_id, date, feeling, note)
            VALUES (?, ?, ?, ?)`,
           [req.session.userId, date, feeling, note], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// AVAILABILITY ROUTES
app.get('/api/availability/:date', requireAuth, (req, res) => {
    db.get('SELECT * FROM availability WHERE user_id = ? AND date = ?',
           [req.session.userId, req.params.date], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row || null);
        }
    });
});

app.get('/api/availability', requireAuth, (req, res) => {
    db.all('SELECT * FROM availability WHERE user_id = ?',
           [req.session.userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/availability', requireAuth, (req, res) => {
    const { date, status, notes } = req.body;

    if (!status && !notes) {
        // Delete if both status and notes are empty
        db.run('DELETE FROM availability WHERE user_id = ? AND date = ?',
               [req.session.userId, date], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });
            }
        });
    } else {
        db.run(`INSERT OR REPLACE INTO availability (user_id, date, status, notes)
                VALUES (?, ?, ?, ?)`,
               [req.session.userId, date, status, notes], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });
            }
        });
    }
});

// BUCKET LIST ROUTES
app.get('/api/bucket-list', requireAuth, (req, res) => {
    db.all('SELECT * FROM bucket_list WHERE user_id = ? ORDER BY created_at DESC',
           [req.session.userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/bucket-list', requireAuth, (req, res) => {
    const { text } = req.body;
    db.run('INSERT INTO bucket_list (user_id, text) VALUES (?, ?)',
           [req.session.userId, text], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, text, completed: false });
        }
    });
});

app.put('/api/bucket-list/:id', requireAuth, (req, res) => {
    const { completed } = req.body;
    db.run('UPDATE bucket_list SET completed = ? WHERE id = ? AND user_id = ?',
           [completed ? 1 : 0, req.params.id, req.session.userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.delete('/api/bucket-list/:id', requireAuth, (req, res) => {
    db.run('DELETE FROM bucket_list WHERE id = ? AND user_id = ?',
           [req.params.id, req.session.userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Serve the main HTML file for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the app`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});