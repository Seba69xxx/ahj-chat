const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 7070 });

const clients = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  clients.set(ws, { id, name: null });

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return;
    }

    if (data.type === 'login') {
      const { nickname } = data;
      
      let isExist = false;
      for (const client of clients.values()) {
        if (client.name === nickname) {
          isExist = true;
          break;
        }
      }

      if (isExist) {
        ws.send(JSON.stringify({ type: 'error', message: 'Nickname is already taken' }));
        return;
      }

      clients.get(ws).name = nickname;
      
      ws.send(JSON.stringify({ type: 'login', user: { id, name: nickname } }));
      
      broadcastUsers();
      return;
    }

    if (data.type === 'send') {
      const clientData = clients.get(ws);
      if (!clientData.name) return;

      const msg = {
        type: 'send',
        message: data.message,
        user: { id: clientData.id, name: clientData.name },
        timestamp: Date.now()
      };
      
      broadcast(msg);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastUsers();
  });
});

function broadcastUsers() {
  const users = [];
  for (const client of clients.values()) {
    if (client.name) {
      users.push({ id: client.id, name: client.name });
    }
  }
  
  const msg = {
    type: 'users',
    users
  };
  
  broadcast(msg);
}

function broadcast(data) {
  const str = JSON.stringify(data);
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  }
}

console.log('Server started on port 7070');