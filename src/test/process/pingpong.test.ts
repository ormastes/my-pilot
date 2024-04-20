import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

const { fork } = require('child_process');
const path = require('path');

const {Message, MessageType} = require('../../Message');

let counter = 0;
const aSuite = suite('Process Test Suite', () => {

	test('Ping pong test', async () => {
        // Path to your worker file
        const workerPath = path.resolve(__dirname, '../../../out/test/process/pong.js');

        // check file exist
        assert.strictEqual(true, require('fs').existsSync(workerPath));

        // Create a child process
        const worker = fork(workerPath);

        worker.on('message', (message:any) => {
            console.log('Received message from worker:', message);
            counter++;
            assert.strictEqual(message.msgtype, 'pong');
        });

        let msg = new Message(new vscode.Position(0,0), "", "", "ping");
        msg.msgtype = MessageType.PING;
        worker.send(msg);


        // yield until counter is 1
        while (counter < 1) {
            await new Promise(r => setTimeout(r, 1000));
        }

    });
});     
aSuite.tests.forEach((t) => {
    t.timeout(120000);
});