const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const PORT = process.env.PORT || 4004;

app.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ service: 'driver-service', status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'db_error', error: error.message });
    }
});

// Create Driver Profile
app.post('/profiles', async (req, res) => {
    try {
        const { authUserId, licenseNumber, vehicleMake, vehicleModel, vehicleYear, plateNumber } = req.body;
        if (!authUserId || !licenseNumber || !plateNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const driverRes = await client.query(
                `INSERT INTO drivers (auth_user_id, license_number, vehicle_make, vehicle_model, vehicle_year, plate_number)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [authUserId, licenseNumber, vehicleMake, vehicleModel, vehicleYear, plateNumber]
            );

            const driverId = driverRes.rows[0].id;
            // Initialize status
            await client.query(
                `INSERT INTO driver_status (driver_id, is_online, current_lat, current_lon) VALUES ($1, FALSE, NULL, NULL)`,
                [driverId]
            );

            await client.query('COMMIT');
            return res.status(201).json(driverRes.rows[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Driver/License/Plate already exists' });
        }
        return res.status(500).json({ message: error.message });
    }
});

app.get('/profiles/:authUserId', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT d.*, ds.is_online, ds.current_lat, ds.current_lon 
      FROM drivers d
      LEFT JOIN driver_status ds ON d.id = ds.driver_id
      WHERE d.auth_user_id = $1
    `, [req.params.authUserId]);

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Update Status (Online/Offline + Location)
app.patch('/status/:driverId', async (req, res) => {
    try {
        const { isOnline, lat, lon } = req.body;
        await pool.query(
            `UPDATE driver_status 
       SET is_online = COALESCE($2, is_online),
           current_lat = COALESCE($3, current_lat),
           current_lon = COALESCE($4, current_lon),
           last_updated = NOW()
       WHERE driver_id = $1`,
            [req.params.driverId, isOnline, lat, lon]
        );
        return res.json({ message: 'Status updated' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Internal API: Find nearby drivers
app.get('/nearby', async (req, res) => {
    // Simple implementation: return all online drivers
    // In production: Use PostGIS for radius search
    try {
        const result = await pool.query(`
      SELECT d.id as driver_id, d.auth_user_id, ds.current_lat, ds.current_lon
      FROM drivers d
      JOIN driver_status ds ON d.id = ds.driver_id
      WHERE ds.is_online = TRUE
    `);
        return res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`driver-service running on ${PORT}`);
});
