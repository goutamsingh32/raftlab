const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const secretKey = 'your-secret-key';
const payload = { username: 'your-username' };

const token = jwt.sign(payload, secretKey);
console.log(token);

io.use((socket, next) => {
  // console.log(socket.handshake.query);
  const token = socket.handshake.query.token;
  console.log(token);
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
    socket.user = decoded;
    console.log(socket.user);
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});


io.on('connection', (socket) => {
  console.log('A user connected:', socket.user);

  socket.on('message', (data) => {
    console.log('Received message:', data);
    io.emit('message', { user: socket.user.username, text: data.text });
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`${socket.user.username} joined room: ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`${socket.user.username} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
