import * as vscode from 'vscode';
import { Range } from 'vscode';

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
  expectedPrev: string[];
  private contents: string[];
  constructor(public position:Position, public prev: string, public next: string, contents: string[]) {
    this.age = 0;
    this.msgtype = MessageType.MESSAGE;
    this.expectedPrev = [];
    this.contents = [];
    this.setContents(contents);
  }
  // contents setter
  setContents(contents: string[]) {
    this.contents = contents;
    for (let content of contents) {
      this.expectedPrev.push(this.prev+content);
    }
  }
  // contents getter
  getContents(): string[] {
    return this.contents;
  }

  static createConciseMessage(document: vscode.TextDocument, position:Position, contents: string[]) {
    const prev = Message.leftWords(document, position, 200);
    const next = Message.rightWords(document, position, 10);
    
    return new Message(position, prev, next, contents);
  }

  static leftWords(document: vscode.TextDocument, position: Position, maxLines: number) : string{
    const minLine = position.line - maxLines;
    const line = (minLine >= 0) ? minLine : 0;
    const leftWord = document.getText(new Range(line, 0, position.line, position.character));
    return leftWord;
  }
  static rightWords(document: vscode.TextDocument, position: Position, maxLines: number) : string{
      const maxLine = position.line + maxLines;
      const line = (document.lineCount > maxLine) ? maxLine : document.lineCount;
      const rightWord = document.getText(new Range(position.line, position.character, line, document.lineAt(line - 1).text.length));
      return rightWord;
  }
}