const dgram = require('dgram');
const os = require('os');
const peerList = require('./peer-list');

const myIp = os.networkInterfaces().wlan0[0].address;
console.log('myIp', myIp);

const BROADCAST_ADDRESS = '128.64.32.255';
const PING_PORT = 23200;
const PING = 0x20;
const PONG = 0x21;
const PING_INTERVAL = 2000;

exports.start = function start() {
  const socket = dgram.createSocket('udp4');

  const ping = ()=> {
    console.log('peerList:', Object.keys(peerList));
    // console.log('ping');
    socket.setBroadcast(true);
    const buf = new Buffer([PING]);
    socket.send(buf, 0, buf.length, PING_PORT, BROADCAST_ADDRESS, ()=> setTimeout(ping, PING_INTERVAL));
  };

  const pong = (info)=> {
    const buf = new Buffer([PONG]);
    socket.send(buf, 0, buf.length, info.port, info.address);
  };

  socket.on('error', err => {
    console.log('socket error', err);
    socket.close();
    setTimeout(start, PING_INTERVAL);
  });

  socket.on('message', (data, info)=> {
    if (info.address == myIp) return;
    if (!data || !data.length) return console.log('invalid message');
    switch (data[0]) {
      case PING: return pong(info);
      case PONG: return addPeer(info);
      default: console.log('invalid command', data[0]);
    }
  });

  socket.on('listening', ()=> {
    console.log('started');
    ping();
  });

  socket.bind(PING_PORT);
};


function addPeer(info) {
  // console.log('add:', info.address);
  // console.log(`pong from ${info.address}:${info.port}`);
  if (peerList[info.address]) clearTimeout(peerList[info.address]);
  peerList[info.address] = setTimeout(key => delete peerList[info.address], Math.floor(PING_INTERVAL * 1.2), info.address);
}
