import express, { Request, Response } from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
  const { 
    email, 
    firstName, 
    lastName, 
    password, 
    jobTitle = null, 
    country = null, 
    city = null, 
    timezone = null, 
    age = null, 
    emergencyContact = null, 
    emergencyContactPhone = null, 
    avatarUrl = null 
  } = req.body;

  if (!email || !firstName || !lastName || !password) {
    res.status(400).json({ message: 'Required fields are missing' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)', 
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await pool.query(
      `INSERT INTO users (
        email, "firstName", "lastName", password, created_at, "jobTitle", 
        country, city, timezone, age, "emergencyContact", "emergencyContactPhone", avatar_url
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        email, firstName, lastName, hashedPassword, jobTitle, 
        country, city, timezone, age, emergencyContact, emergencyContactPhone, avatarUrl
      ]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
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
  const { prompt, model = 'llama3.2:latest' } = req.body;

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
        model,
        prompt,
        stream: true, // Enable streaming from Ollama server
      }),
    });

    // Set headers to enable streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (response.body) {
      // response.body is of type ReadableStream<Uint8Array>
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      // Function to read and send data chunks
      const readChunk = async () => {
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) {
            done = true;
            break;
          }
          if (value) {
            const chunk = decoder.decode(value);
            res.write(chunk);
          }
        }
        res.end();
      };

      readChunk().catch((err) => {
        console.error('Error reading stream:', err);
        res.end();
      });
    } else {
      res.status(500).json({ message: 'No response body from Ollama server.' });
    }
  } catch (error) {
    console.error('Error connecting to Ollama server:', error);
    res.status(500).json({ message: 'Error connecting to Ollama server.' });
  }
});

// Start the backend server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});