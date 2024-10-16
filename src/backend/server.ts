import express, { Request, Response } from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';  // Make sure to import fetch for Node.js if needed

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3001;

// PostgreSQL connection pool with conditional SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,  // Enable SSL in production only
});

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running!');
});

// Endpoint for user registration (to hash and store password)
app.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, firstName, lastName, password } = req.body;

  // Log incoming data to ensure proper data is being received
  console.log("Incoming registration data:", { email, firstName, lastName, password });

  if (!email || !firstName || !lastName || !password) {
    res.status(400).json({ message: 'Email, first name, last name, and password are required' });
    return;
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

    if (userExists.rows.length > 0) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash the plain-text password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed password:", hashedPassword);

    // Insert the new user with the hashed password into the database
    await pool.query(
      'INSERT INTO users (email, firstName, lastName, password, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [email, firstName, lastName, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Endpoint for user login (compare password with hashed password in the database)
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    // Query the user by email (case-insensitive)
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

    if (result.rows.length === 0) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password stored in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    // Exclude the password from the user object before sending it back
    const { password: _password, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Chat API endpoint (connecting to Ollama server)
app.post('/api', async (req: Request, res: Response): Promise<void> => {
  const { prompt, model = 'llama3.2:latest', stream = false } = req.body;  // Ensure model and stream are accepted in the request body

  if (!prompt) {
    res.status(400).json({ message: 'Prompt is required' });
    return;
  }

  try {
    const response = await fetch('http://192.168.2.45:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,    // Use the model field
        prompt,   // User's prompt from the request
        stream,   // Use the stream field (default to false)
      }),
    });
    const data = await response.json();
    res.json(data);  // Send the Ollama server's response back to the client
  } catch (error) {
    console.error('Error connecting to Ollama server:', error);
    res.status(500).json({ message: 'Error connecting to Ollama server.' });
  }
});

// Start the backend server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
