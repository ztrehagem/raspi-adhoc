const net = require('net');
const peerList = require('./peer-list');
const informations = require('./informations');

const SERVER_PORT = 23300;
const TYPE_REGISTER = 0x10;

exports.start = function start() {
  const server = net.createServer(listener);
  server.on('error', ()=> server.close(()=> start()));
  server.listen(SERVER_PORT);
  console.log('start server');
};

function listener(socket) {
  const bufs = [];

  const gen = function*(dest) {
    dest.type = (yield 1).readUInt8();
    yield 7;
    dest.uuid = (yield 36).toString();
    dest.bodyLen = (yield 4).readUInt32BE();
    dest.body = JSON.parse((yield dest.bodyLen).toString());
    dest.knownsLen = (yield 2).readUInt16BE();
    dest.knowns = [];
    for (let i = 0; i < dest.knownsLen; i++) {
      const iparr = [];
      for (let j = 0; j < 4; j++) {
        const a = yield 1;
        console.log('iparr', j, a);
        iparr.push(a.readUInt8());
      }
      dest.knowns.push(iparr.join('.'));
    }
  };

  socket.on('data', data => bufs.push(data));

  socket.on('end', ()=> {
    const buf = Buffer.concat(bufs);
    const obj = {};
    const proc = gen(obj);
    let read = 0;
    let require = proc.next().value;
    while (require) {
      const slice = buf.slice(read, read + require);
      require = proc.next(slice).value;
      read += slice.length;
    }
    console.log(obj);
    processInformation(obj);
    // broadcast(buf, obj);
    broadcast(obj);
  });
}

function processInformation({type, uuid, body}) {
  switch (type) {
    case TYPE_REGISTER:
    informations[uuid] = body;
    break;
  }
  console.log(informations);
}

function broadcast(obj) {
  const targets = Object.keys(peerList).filter(peer => obj.knowns.every(known => peer != known));
  console.log('targets', targets);
  if (!targets.length) {
    return;
  }
  const bufs = [];
  bufs.push(Buffer.from([TYPE_REGISTER, 0, 0, 0, 0, 0, 0, 0]));
  bufs.push(Buffer.from(obj.uuid));
  const bodyLenBuf = Buffer.alloc(4);
  bodyLenBuf.writeUInt32BE(obj.bodyLen);
  bufs.push(bodyLenBuf);
  bufs.push(Buffer.from(JSON.stringify(obj.body)));
  const knownsLenBuf = Buffer.alloc(2);
  knownsLenBuf.writeUInt16BE(obj.knownsLen + targets.length);
  bufs.push(knownsLenBuf);
  const knownsSplitted = obj.knowns.concat(targets).map(address => address.split('.').map(n => parseInt(n)));
  bufs.push(Buffer.from(joinArray(knownsSplitted)));

  const buf = Buffer.concat(bufs);
  targets.forEach(address => send(address, buf));
}

function send(address, buf) {
  console.log('send', address, buf);
  const socket = net.createConnection(SERVER_PORT, address, ()=> {
    console.log('sending', address);
    socket.end(buf);
  });
  socket.on('error', ()=> {
    console.log('sending socket error');
  });
}

function joinArray(arr) {
  const ret = [];
  for (const e of arr) {
    ret.push(...e);
  }
  return ret;
}
