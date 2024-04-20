const { Worker } = require('worker_threads');
import * as vscode from 'vscode';
const { Message } = require('./Message');


let response = new Message(new vscode.Position(0,0), "", "", "");
const { fork } = require('child_process');
const path = require('path');

// Path to your worker file
const workerPath = path.resolve(__dirname, '/out/BackGroundWorker.js');

// Create a child process
const worker = fork(workerPath);
let model :any = null;

worker.on('message', (message:any) => {
  console.log('Received message from worker:', message);
  setResponse(message);
});
worker.send('ping');

export function setWorkerModel(_model:any):void {
  model = _model;
}
export function getWorkerModel():any {
  return model;
}
export function getResponse():any {
  return response;
}
export function setResponse(_response:any):void {
    response = _response;
}
export function getWorker():Worker {
  return worker;
}   
export function sendMessage(message:any):void {
  worker.send(message);
}
export function startWorker():void {
  worker.send('');
}