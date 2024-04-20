// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const { Message, SetMainThread } = require('./Message');
SetMainThread(true);
const {} = require('./BackGroundWorker');

//const { LlamaCpp } = require("@langchain/community/llms/llama_cpp");
const llamaPath = "../models/llama-2-13b.Q6_K.gguf";
//const model = new LlamaCpp({ modelPath: llamaPath, temperature: 0.7 });

import { MyIlineCompletionItemProvider } from './MyIlineCompletionItemProvider';

const { FakeListLLM } = require("langchain/llms/fake");
const {NodeLlamaCpp, LLAMA2_PATH} = require('./NodeLlamaCpp');
const { PromptTemplate } = require('@langchain/core/prompts');
const { setWorkerModel, getResponse, sendMessage, startWorker } = require('./WorkerInterface');
const { MyEventListener } = require('./EventListener');


//import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
const llm = new FakeListLLM({
	responses: ["I'll callback later.", "You 'console' them!"],
  });

let eventListener:any;
 
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
	try {
		var model = new NodeLlamaCpp({ modelPath:llamaPath, temperature: 0.7 });
		model._simpleCall("You are a coding assistant. Ready?").then((response:any)=>{
			console.log("Model loaded.", response);

			const promptText = "Suggest code where {{NEW CODE}} is placed:\n"
			+"Source Code To update:\nint add(int a, int b) {{\n{{NEW CODE}}\n}}\n"
			+"Suggested NEW CODE:\n<1>\nreturn a + b;\n<2>\nint result = a + b;\nreturn result;\n"
			+"Source Code To update:\n{prev}{{NEW CODE}}{post}\nSuggested NEW CODE:\n";
			
			const multipleInputPrompt = new PromptTemplate({
				inputVariables: ["prev", "post"],
				template: promptText,});

			const chain = multipleInputPrompt.pipe(model);
			setWorkerModel(chain);
			eventListener = new MyEventListener(getResponse, sendMessage);
			startWorker();
		});
		
	}catch (e) {
		console.error(e);
	}

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	eventListener.dispose();
}
