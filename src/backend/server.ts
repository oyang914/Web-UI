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

// Reset password endpoint (to update the user's password in the database)
app.post('/resetpassword', async (req: Request, res: Response): Promise<void> => {
  const {password, email, confirmPassword} = req.body;

  if (confirmPassword != password) {
    res.status(400).json({ message: 'Passwords are not the same' });
    return;
  }

  try {
    // Query the user by old password (case-insensitive)
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

    if (result.rows.length === 0) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    // Update the user's password in the database
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Endpoint for user registration (to hash and store password)
app.post('/register', async (req: Request, res: Response): Promise<void> => {
  const {
    username,
    email,
    password,
    name,
    emergency_contact_name,
    emergency_contact_number,
  } = req.body;

  if (!email || !emergency_contact_name || !name || !password || !emergency_contact_number || !username) {
    res.status(400).json({ message: 'Required fields are missing' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const insertQuery = `
      INSERT INTO users (
        username, email, password_hash, name, emergency_contact_name, emergency_contact_number, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, username, email, name, emergency_contact_name, emergency_contact_number, created_at
    `;

    await pool.query(
      insertQuery,
      [username, email, password_hash, name, emergency_contact_name, emergency_contact_number]
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
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

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

// get user by id api
app.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// update user api
app.post('/api/users/update', async (req: Request, res: Response): Promise<void> => {
  const userId = req.body.user_id;
  const { name, email, emergency_contact_name, emergency_contact_number } = req.body;

  // check param is true
  if (!name || !email || !emergency_contact_name || !emergency_contact_number) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }
  try {
    // update user
    await pool.query(
      `UPDATE users
       SET name = $1, email = $2, emergency_contact_name = $3, emergency_contact_number = $4
       WHERE id = $5`,
      [name, email, emergency_contact_name, emergency_contact_number, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error during user update' });
  }
});


// update user api
app.post('/api/users/updatePwd', async (req: Request, res: Response): Promise<void> => {
  const userId = req.body.user_id;
  const { password } = req.body;

  // check param is true
  if (!password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    console.log(password_hash);
    console.log(userId);
    // update user
    await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [password_hash,userId]
    );

    res.json({ message: 'User Password updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error during user update' });
  }
});



// Start the backend server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});


// POST endpoint to receive sensor data from the ESP32 device
app.post("/api/sensors", async (req: Request, res: Response): Promise<void> => {
  try {
      const { macAddress, uvData, bmp280Data, mpu6050Data, gy511Data, max3010Data } = req.body;

      if (!macAddress) {
          res.status(400).json({ error: "MAC address required" });
      }

      // Check if the MAC address exists in the devices table
      let deviceQuery = await pool.query(
          "SELECT device_id FROM devices WHERE mac_address = $1",
          [macAddress]
      );

      let deviceId;
      if (deviceQuery.rows.length === 0) {
          // New device → register it
          const newDevice = await pool.query(
              "INSERT INTO devices (mac_address) VALUES ($1) RETURNING device_id",
              [macAddress]
          );
          deviceId = newDevice.rows[0].device_id;
      } else {
          // Existing device
          deviceId = deviceQuery.rows[0].device_id;
      }

      // Insert sensor data with the associated device_id
      const insertQuery = `
          INSERT INTO sensor_data (device_id, uv_data, bmp280_data, mpu6050_data, gy511_data, max3010_data)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
      `;
      const result = await pool.query(insertQuery, [
          deviceId,
          JSON.stringify(uvData),
          JSON.stringify(bmp280Data),
          JSON.stringify(mpu6050Data),
          gy511Data,
          JSON.stringify(max3010Data)
      ]);

      res.status(201).json({ message: "Data inserted successfully", data: result.rows[0] });
  } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/latest-max3010", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT max3010_data
      FROM sensor_data
      ORDER BY timestamp DESC
      LIMIT 1
  ` );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "No data found" });
      return;
    }
    res.json({ max3010_data: result.rows[0].max3010_data }); // return jsonb data
  } catch (error) {
    console.error("Error fetching max3010_data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET endpoint to return the latest sensor data
app.get('/api/latest-sensor', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT uv_data, bmp280_data, mpu6050_data, gy511_data, max3010_data, timestamp
      FROM sensor_data
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No sensor data found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// uv_data get endpoint
app.get("/api/latest-uv", async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(`
    SELECT uv_data
    FROM sensor_data
    ORDER BY timestamp DESC
    LIMIT 1
  `);
  if (result.rows.length === 0) {
    res.status(404).json({ message: "No data found" });
    return;
  }
  res.json({ uv_data: result.rows[0].uv_data });
});

// latest blood oxygen endpoint
app.get('/api/latest-blood-oxygen', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT max3010_data
      FROM sensor_data
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No sensor data found' });
    }

    const max3010_data = result.rows[0].max3010_data;     const parsedData = typeof max3010_data === 'string' ? JSON.parse(max3010_data) : max3010_data;
    const bloodOxygen = parsedData[1]; // 取 SpO2

    res.json({ bloodOxygen });
  } catch (error) {
    console.error('Error fetching blood oxygen:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




// get step count endpoint
app.get('/api/steps', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT mpu6050_data
      FROM sensor_data
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No sensor data found' });
      return;
    }

    const mpu6050_data = result.rows[0].mpu6050_data;
    // If mpu6050_data is stored as a JSON string, parse it
    const parsedData = typeof mpu6050_data === 'string' ? JSON.parse(mpu6050_data) : mpu6050_data;
    const stepCount = parsedData[0]; // get step count from the first element

    res.json({ stepCount });
  } catch (error) {
    console.error('Error fetching step count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// get api for account info
// Example in your Express server file
app.get('/api/account', async (req: Request, res: Response): Promise<void> => {
  try {
    // Adjust the user ID as needed (could come from session, token, query param, etc.)
    const userId = 3;

    const query = `
      SELECT
        id,
        username,
        email,
        role,
        name,
        emergency_contact_name,
        emergency_contact_number,
        device_id,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

