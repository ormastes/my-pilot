// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const { Message, SetMainThread } = require('./Message');
SetMainThread(true);
const {} = require('./BackGroundWorker');

const { FakeListLLM } = require("langchain/llms/fake");
const { MyEventListener } = require('./EventListener');
const { LlmProvider, LlmType } = require('./LlmProvider');


const provider = LlmType.StartCoder2;
const modelGpuInput = {
	n_gpu_layers: 32,
	n_threads: 1,
};

const llm = new FakeListLLM({
	responses: ["I'll callback later.", "You 'console' them!"],
});

let eventListener:any;
let llmProvider;
let chain;
let testModel:any = null;
export function setTestModel(model:any){
	testModel = model;
}
 
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	if (testModel !== null){
		return;
	}
	const config = vscode.workspace.getConfiguration('my-pilot');
	const llmName = config.get('llm_name');
	const llmInput = config.get('llm_input');
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
	
	llmProvider = new LlmProvider(llmName, llmInput);
	chain = llmProvider.getChain();
	chain.then((chain:any) => {
		eventListener = new MyEventListener(chain);
		eventListener.activate();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	eventListener.dispose();
}
