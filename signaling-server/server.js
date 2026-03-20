import http from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 4444;
const rooms = new Map();

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('signaling server ok');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const subscribedRooms = new Set();
  let closed = false;

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }

    if (msg.type === 'subscribe') {
      const topics = Array.isArray(msg.topics) ? msg.topics : [];
      for (const topic of topics) {
        if (typeof topic !== 'string') continue;
        subscribedRooms.add(topic);
        if (!rooms.has(topic)) rooms.set(topic, new Set());
        rooms.get(topic).add(ws);
      }
    }

    if (msg.type === 'unsubscribe') {
      const topics = Array.isArray(msg.topics) ? msg.topics : [];
      for (const topic of topics) {
        subscribedRooms.delete(topic);
        rooms.get(topic)?.delete(ws);
        if (rooms.get(topic)?.size === 0) rooms.delete(topic);
      }
    }

    if (msg.type === 'publish') {
      const topic = msg.topic;
      if (typeof topic !== 'string') return;
      const peers = rooms.get(topic);
      if (!peers) return;
      const payload = JSON.stringify(msg);
      for (const peer of peers) {
        if (peer !== ws && peer.readyState === 1) {
          peer.send(payload);
        }
      }
    }

    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  });

  ws.on('close', () => {
    if (closed) return;
    closed = true;
    for (const topic of subscribedRooms) {
      rooms.get(topic)?.delete(ws);
      if (rooms.get(topic)?.size === 0) rooms.delete(topic);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
