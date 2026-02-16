const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 4005;
const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || 'http://driver-service:4004';

app.get('/health', (_req, res) => {
    res.json({ service: 'socket-service', status: 'ok' });
});

// Store socket IDs
const riders = {}; // userId -> socketId
const drivers = {}; // driverId -> socketId

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Authenticate/Identify
    socket.on('join', ({ userId, role, driverId }) => {
        if (role === 'RIDER') {
            riders[userId] = socket.id;
            console.log(`Rider ${userId} joined`);
        } else if (role === 'DRIVER') {
            if (driverId) {
                drivers[driverId] = socket.id;
                console.log(`Driver ${driverId} joined`);
            }
        }
    });

    // Driver sends location update
    socket.on('driver:update-location', async ({ driverId, lat, lon }) => {
        try {
            // Update in driver-service
            await axios.patch(`${DRIVER_SERVICE_URL}/status/${driverId}`, {
                lat, lon, isOnline: true
            });
            // Broadcast to riders looking for cars (omitted for simplicity, usually rooms)
        } catch (error) {
            console.error('Error updating location:', error.message);
        }
    });

    // Internal API to trigger events from other services
    socket.on('disconnect', () => {
        // Cleanup
        // Logic to find and remove user from maps
        console.log('Client disconnected:', socket.id);
    });
});

// HTTP API for internal services to push notifications
app.use(express.json());

app.post('/notify/driver', (req, res) => {
    const { driverId, event, data } = req.body;
    const socketId = drivers[driverId];
    if (socketId) {
        io.to(socketId).emit(event, data);
        return res.json({ success: true });
    }
    return res.status(404).json({ success: false, message: 'Driver not connected' });
});

app.post('/notify/rider', (req, res) => {
    const { userId, event, data } = req.body;
    const socketId = riders[userId];
    if (socketId) {
        io.to(socketId).emit(event, data);
        return res.json({ success: true });
    }
    return res.status(404).json({ success: false, message: 'Rider not connected' });
});

server.listen(PORT, () => {
    console.log(`socket-service running on ${PORT}`);
});
