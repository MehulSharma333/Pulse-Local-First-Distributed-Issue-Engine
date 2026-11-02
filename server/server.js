import http from 'http';
import { WebSocketServer } from 'ws';
// Import the standard connection setup from y-websocket bin utils
import { setupWSConnection } from 'y-websocket/bin/utils';

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    service: 'Pulse Local-First WebSocket Relay',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, { gc: true });
});

server.listen(port, () => {
  console.log(`🚀 [Pulse Sync Relay] WebSocket server running on ws://localhost:${port}`);
});
