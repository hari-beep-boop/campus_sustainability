import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const router = express.Router();

let activeClients = [];

export function broadcastLiveUpdate(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  activeClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      // Client closed
    }
  });
}

// GET /api/v1/stream/live - Server-Sent Events stream
router.get('/live', (req, res) => {
  // Optional token in query for SSE clients
  const token = req.query.token;
  if (token) {
    try {
      jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid stream token' } });
    }
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  activeClients.push(newClient);

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date() })}\n\n`);

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    activeClients = activeClients.filter((c) => c.id !== clientId);
  });
});

export default router;
