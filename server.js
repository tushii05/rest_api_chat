const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./database');

const server = http.createServer(app);
const io = new Server(server);

io.use(async (socket, next) => {
  if (socket.handshake.headers.cookie) {
    const token = socket.handshake.headers.cookie.split('=')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findOne({ where: { id: decoded.id, jwtToken: token } });
      if (!user) throw new Error('Invalid token.');
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const username = socket.user.username;
  console.log(`${username} connected`);

  socket.on('createRoom', (roomName) => {
    socket.join(roomName);
    io.to(roomName).emit('message', { user: 'system', msg: `${username} has created and joined the room ${roomName}.` });
    console.log(`${username} created and joined room ${roomName}`);
  });


  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    io.to(roomName).emit('message', { user: 'system', msg: `${username} has joined the room ${roomName}.` });
    console.log(`${username} joined room ${roomName}`);
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    io.to(roomName).emit('message', { user: 'system', msg: `${username} has left the room ${roomName}.` });
    console.log(`${username} left room ${roomName}`);
  });

  socket.on('message', (data) => {
    const { roomName, msg } = data;
    io.to(roomName).emit('message', { user: username, msg }); // Emitting the message to the specified room
  });


  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
    const rooms = Object.keys(socket.rooms).filter(room => room !== socket.id);
    rooms.forEach(roomName => {
      io.to(roomName).emit('message', { user: 'system', msg: `${username} has left the room.` });
    });
  });
});

server.listen(2020, () => {
  console.log('Server is running on port 2020');
});
