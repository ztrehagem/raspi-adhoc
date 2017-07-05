const net = require('net');
const uuid = require('uuid/v4');

const socket = net.createConnection(23300, '127.0.0.1', ()=> {
  socket.write(Buffer.from([0x10, 0, 0, 0, 0, 0, 0, 0]));
  socket.write(Buffer.from(uuid()));
  const body = Buffer.from(JSON.stringify({
    hoge: 'fuga'
  }));
  socket.write(Buffer.from([0, 0, 0, body.length]));
  socket.write(body);
  socket.write(Buffer.from([0, 0]));
  socket.end();
});
