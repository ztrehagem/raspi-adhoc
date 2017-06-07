const dgram = require('dgram');
const os = require('os');

const ifaces = os.networkInterfaces();
const myip = ifaces['wlan0'][0].address;

const server = dgram.createSocket('udp4');

server.on('error', err => {
  console.log('error');
  console.error(err);
  server.close();
});

server.on('message', (msg, rinfo)=> {
  console.log('got message');
  console.log('' + msg);
  console.log(rinfo);

  const buf = new Buffer(`myip ${myip}`);
  server.send(buf, 0, buf.length, rinfo.port, rinfo.address);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(8000);
