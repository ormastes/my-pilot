// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

//const { LlamaCpp } = require("@langchain/community/llms/llama_cpp");
const llamaPath = "../models/llama-2-13b.Q6_K.gguf";
//const model = new LlamaCpp({ modelPath: llamaPath, temperature: 0.7 });

import { inlineCompletionProvider } from './MyIlineCompletionItemProvider';
const { FakeListLLM } = require("langchain/llms/fake");
const {NodeLlamaCpp} = require('./NodeLlamaCpp');

try {
	console.log('load module')
	
	const model = new NodeLlamaCpp({ modelPath:llamaPath, temperature: 0.7 });
	console.log('loaded module')
} catch (e) {
	console.log(e)
}


//import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
const llm = new FakeListLLM({
	responses: ["I'll callback later.", "You 'console' them!"],
  });

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "my-pilot" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('my-pilot.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from my-pilot!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
