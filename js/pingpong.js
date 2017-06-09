const dgram = require('dgram');
const os = require('os');

const selfAddress = os.networkInterfaces()['wlan0'][0].address;
console.log('selfAddress', selfAddress);

const ADDRESS_BROADCAST = '128.64.32.255';
const PING_PORT = 8000;
const PING = 0x20;
const PONG = 0x21;

startPingPong();

function startPingPong() {
  const socket = dgram.createSocket('udp4');

  socket.on('error', err => {
    console.log('socket error');
    console.error(err);
    socket.close();
    setTimeout(startPingPong, 500);
  });

  socket.on('message', (data, info)=> {
    if (info.address == selfAddress) {
      return;
    }
    if (!data || !data.length) {
      return console.log('invalid message');
    }
    switch (data[0]) {
      case PING: return pong(info);
      case PONG: return add_peer(info);
    }
    console.log('invalid command', data[0]);
  });

  socket.on('listening', ()=> {
    console.log('started');
    ping();
  });

  socket.bind(PING_PORT);

  function ping() {
    console.log('ping');
    socket.setBroadcast(true);
    const buf = new Buffer([PING]);
    socket.send(buf, 0, buf.length, PING_PORT, ADDRESS_BROADCAST, ()=> {
      setTimeout(ping, 2000);
    });
  }

  function pong(info) {
    const buf = new Buffer([PONG]);
    socket.send(buf, 0, buf.length, info.port, info.address);
  }
}


function add_peer(info) {
  console.log(`pong from ${info.address}:${info.port}`);
}
