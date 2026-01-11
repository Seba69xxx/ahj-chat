export default class ChatAPI {
  constructor() {
    this.url = 'wss://ahj-chat-rx22.onrender.com'; 
    this.ws = null;
    this.onMessage = null;
  }

  connect(callback) {
    this.ws = new WebSocket(this.url);
    this.onMessage = callback;

    this.ws.addEventListener('open', () => {
      console.log('Connected to WS');
    });

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(data);
      }
    });

    this.ws.addEventListener('close', () => {
      console.log('Disconnected');
    });

    this.ws.addEventListener('error', () => {
      console.log('Error');
    });
  }

  login(nickname) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'login', nickname }));
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'send', message }));
    }
  }
}