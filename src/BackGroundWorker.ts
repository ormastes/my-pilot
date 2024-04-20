const { parentPort } = require('worker_threads');

const { Message, IsMainThread, MessageType } = require('./Message');
const EventEmitter = require('events');

if (IsMainThread() === true) {
  console.log('This is the main thread.');
} else {
  const myEmitter = new EventEmitter();

  let messageQueue: any[] = [];

  process.on('message', (message: any) => {
    console.log('received:', message);
    if (message == 'ping') {
      if (process == null || process.send == null) {
        console.log('process is null');
        return;
      }
      process.send('pong');
      return;
    }
    myEmitter.emit('message', message);
  });

  myEmitter.on('message', (message: any) => {
    console.log('received:', message);
    if (message != null) {
      messageQueue.push(message);
      return;
    }
    if (messageQueue.length == 0) return;
    let last = messageQueue[messageQueue.length - 1];

    if (messageQueue.length == 1) {
      if (last.age >= 1) {
        console.log('last message:', last);
        messageQueue = [];
        if (process == null || process.send == null) {
          console.log('process is null');
          return;
        }
        if (last.msgtype == MessageType.BYPASS) {
          process.send(last);
        } else {
          process.send(new Message(last.position, last.prev, last.next, "I'll callback later."));
        }
        
        myEmitter.emit('message', null);
      } else {
        last.age++;
      }
    } else {
      last.age = 0;
    }
    messageQueue = [last];
    setInterval(() => { myEmitter.emit('message', null); }, 1000);
  });
}
