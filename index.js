const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Dhruv@2981',
    database: 'notesapp'
});

// Authentication routes
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    try {
        const result = await db.execute('INSERT INTO users (username, password) VALUES (?,?)', [username, hashedPassword]);
        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send({ message: 'Error on the server.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.execute('SELECT * FROM users WHERE username =?', [username]);
        if (result.length === 0) {
            res.status(404).send({ message: 'No user found.' });
        } else {
            const user = result[0];
            const passwordIsValid = await bcrypt.compare(password, user.password);
            if (!passwordIsValid) {
                res.status(401).send({ auth: false, token: null });
            } else {
                const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 }); // expires in 24 hours
                res.status(200).send({ auth: true, token });
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Error on the server.' });
    }
});

// Middleware to verify token
async function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
}

// CRUD routes for notes
app.post('/notes', verifyToken, async (req, res) => {
    const { title, content, tags, backgroundColor, reminder } = req.body;
    const userId = req.userId;
    try {
        const result = await db.execute('INSERT INTO notes (userId, title, content, tags, backgroundColor, reminder) VALUES (?,?,?,?,?,?)', [userId, title, content, tags.join(','), backgroundColor, reminder]);
        res.status(201).send({ message: 'Note created successfully!' });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).send({ message: 'Error on the server.' });
    }
});

app.get('/notes', verifyToken, async (req, res) => {
    const userId = req.userId;
    try {
        const result = await db.execute('SELECT * FROM notes WHERE userId =?', [userId]);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error loading notes:', error);
        res.status(500).send({ message: 'Error on the server.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});