const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
async function initializeDatabase() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER DEFAULT 1,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS feelings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER DEFAULT 1,
                date TEXT NOT NULL UNIQUE,
                feeling TEXT NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS availability (
                id SERIAL PRIMARY KEY,
                user_id INTEGER DEFAULT 1,
                date TEXT NOT NULL UNIQUE,
                status TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS bucket_list (
                id SERIAL PRIMARY KEY,
                user_id INTEGER DEFAULT 1,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Initialize on first run
initializeDatabase();

// REQUESTS ROUTES
app.get('/api/requests', async (req, res) => {
    try {
        const requests = await sql`
            SELECT * FROM requests
            WHERE user_id = 1
            ORDER BY created_at DESC
        `;
        res.json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        const { text } = req.body;
        const result = await sql`
            INSERT INTO requests (user_id, text)
            VALUES (1, ${text})
            RETURNING *
        `;
        res.json(result[0]);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/requests/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const { id } = req.params;

        await sql`
            UPDATE requests
            SET completed = ${completed}
            WHERE id = ${id} AND user_id = 1
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql`
            DELETE FROM requests
            WHERE id = ${id} AND user_id = 1
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ error: error.message });
    }
});

// FEELINGS ROUTES
app.get('/api/feelings/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const result = await sql`
            SELECT * FROM feelings
            WHERE user_id = 1 AND date = ${date}
        `;
        res.json(result[0] || null);
    } catch (error) {
        console.error('Get feelings error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/feelings', async (req, res) => {
    try {
        const { date, feeling, note } = req.body;
        await sql`
            INSERT INTO feelings (user_id, date, feeling, note)
            VALUES (1, ${date}, ${feeling}, ${note})
            ON CONFLICT (date)
            DO UPDATE SET feeling = ${feeling}, note = ${note}, created_at = CURRENT_TIMESTAMP
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Save feelings error:', error);
        res.status(500).json({ error: error.message });
    }
});

// AVAILABILITY ROUTES
app.get('/api/availability/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const result = await sql`
            SELECT * FROM availability
            WHERE user_id = 1 AND date = ${date}
        `;
        res.json(result[0] || null);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/availability', async (req, res) => {
    try {
        const availability = await sql`
            SELECT * FROM availability
            WHERE user_id = 1
        `;
        res.json(availability);
    } catch (error) {
        console.error('Get all availability error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/availability', async (req, res) => {
    try {
        const { date, status, notes } = req.body;

        if (!status && !notes) {
            // Delete if both status and notes are empty
            await sql`
                DELETE FROM availability
                WHERE user_id = 1 AND date = ${date}
            `;
        } else {
            await sql`
                INSERT INTO availability (user_id, date, status, notes)
                VALUES (1, ${date}, ${status}, ${notes})
                ON CONFLICT (date)
                DO UPDATE SET status = ${status}, notes = ${notes}, created_at = CURRENT_TIMESTAMP
            `;
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Save availability error:', error);
        res.status(500).json({ error: error.message });
    }
});

// BUCKET LIST ROUTES
app.get('/api/bucket-list', async (req, res) => {
    try {
        const bucketList = await sql`
            SELECT * FROM bucket_list
            WHERE user_id = 1
            ORDER BY created_at DESC
        `;
        res.json(bucketList);
    } catch (error) {
        console.error('Get bucket list error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bucket-list', async (req, res) => {
    try {
        const { text } = req.body;
        const result = await sql`
            INSERT INTO bucket_list (user_id, text)
            VALUES (1, ${text})
            RETURNING *
        `;
        res.json(result[0]);
    } catch (error) {
        console.error('Create bucket list error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/bucket-list/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const { id } = req.params;

        await sql`
            UPDATE bucket_list
            SET completed = ${completed}
            WHERE id = ${id} AND user_id = 1
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Update bucket list error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/bucket-list/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql`
            DELETE FROM bucket_list
            WHERE id = ${id} AND user_id = 1
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Delete bucket list error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;