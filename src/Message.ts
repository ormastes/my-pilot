import * as vscode from 'vscode';

let _IsMainThread = true;
export function IsMainThread() {
  return _IsMainThread;
}
export function SetMainThread(value: boolean) {
  _IsMainThread = value;
}
export enum MessageType {
  PING = "ping",
  PONG = "pong",
  MESSAGE = "message",
  INIT_MODEL = "init_model",
  BYPASS = "bypass",
}
export class Position {
  constructor(public line: number, public character: number) {}

}
export class Message {
  msgtype: string;
  age: number;
  constructor(public position:Position, public prev: string, public next: string, public content: string) {
    this.age = 0;
    this.msgtype = MessageType.MESSAGE;
  }
}