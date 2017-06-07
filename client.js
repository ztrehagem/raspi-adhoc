const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.on('message', (msg, info)=> {
  console.log('got response');
  console.log('' + msg);
  console.log(info);
  socket.close();
});

socket.on('listening', ()=> {
  socket.setBroadcast(true);
  const msg = new Buffer('Hello!');
  socket.send(msg, 0, msg.length, 8000, '128.64.32.255');
});

socket.bind();
