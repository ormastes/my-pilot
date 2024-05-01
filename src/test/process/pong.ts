// respone to ping

const {Message, MessageType, Position} = require('../../Message');

process.on('message', (message:any) => {
    console.log('received:', message);
    if (message.msgtype == 'ping') {
      if (process == null || process.send == null) {
        console.log('process is null');
        return;
      }
      let msg = new Message(new Position(0,0), "", "", "pong");
      msg.msgtype = MessageType.PONG;
      process.send('pong');
      return;
    }
    console.log('should not be here');
  });
  