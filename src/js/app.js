import ChatAPI from './api/ChatAPI';

const api = new ChatAPI();
let currentUser = null;

const loginModal = document.querySelector('#login-modal');
const loginForm = document.querySelector('#login-form');
const errorMsg = document.querySelector('.error-msg');
const chatInterface = document.querySelector('#chat-interface');
const usersList = document.querySelector('#users-list');
const messagesBox = document.querySelector('#messages-box');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('.chat-input');

api.connect((data) => {
  console.log('Received:', data);

  if (data.type === 'login') {
    currentUser = data.user;
    loginModal.classList.add('hidden');
    chatInterface.classList.remove('hidden');
    return;
  }

  if (data.type === 'error') {
    errorMsg.textContent = data.message;
    errorMsg.classList.remove('hidden');
    return;
  }

  if (data.type === 'users') {
    renderUsers(data.users);
    return;
  }

  if (data.type === 'send') {
    renderMessage(data);
  }
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nickname = loginForm.querySelector('input').value.trim();
  if (nickname) {
    api.login(nickname);
  }
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (text) {
    api.sendMessage(text);
    chatInput.value = '';
  }
});

function renderUsers(users) {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.classList.add('user-item');
    if (currentUser && user.name === currentUser.name) {
      li.classList.add('me');
    }

    li.innerHTML = `
      <div class="user-avatar"></div>
      <div class="user-name">${user.name === currentUser?.name ? 'You' : user.name}</div>
    `;
    usersList.appendChild(li);
  });
}

function renderMessage(data) {
  const { user, message, timestamp } = data;
  const isMe = user.name === currentUser?.name;
  
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(isMe ? 'me' : 'others');

  const date = new Date(timestamp);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    <div class="message-header">${isMe ? 'You' : user.name}, ${time}</div>
    <div class="message-content">${message}</div>
  `;

  messagesBox.appendChild(div);
  messagesBox.scrollTo(0, messagesBox.scrollHeight);
}