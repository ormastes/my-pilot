import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
const {NodeLlamaCpp,LLAMA2_PATH } = require('../NodeLlamaCpp');
const { PromptTemplate } = require('@langchain/core/prompts');



const aSuite = suite('Llama.cpp Test Suite', () => {
    // set timeout
	vscode.window.showInformationMessage('Start all tests.');

	test('Init llama model', (() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
	}));

    test('Init llama model waitInit', (() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
        return model._waitInit().then((session:any)=>{
            assert.notEqual(session, null);
            return session;
        });
	})); //5 seconds
    test('Init llama model SingleQuery', (() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
        return model._waitInit().then((session:any)=>{
            return session;
        }).then((session:any)=>{
            return session.prompt("Hello llama model");
        }).then((response:any)=>{
            assert.notEqual(response, null);
            assert.notEqual(response, "");
            console.log(response);
            return response;
        });
	})); // 20 seconds
    test('Init llama model QueryWithoutInit', (() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
        return model._simpleCall("Hello llama model").then((response:any)=>{
            assert.notEqual(response, null);
            assert.notEqual(response, "");
            console.log(response);
            return response;
        });
	})); // 27 seconds


    test('template', async() => {
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: ["adjective", "content"],
            template: "Tell me a {adjective} joke about {content}.",
          });
        const formattedMultipleInputPrompt = await multipleInputPrompt.format({
        adjective: "funny",
        content: "chickens",
        });
        assert.strictEqual(formattedMultipleInputPrompt, "Tell me a funny joke about chickens.");
	});
    test('pipe', async() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: ["adjective", "content"],
            template: "Tell me a {adjective} joke about {content}.",
          });
        const chain = multipleInputPrompt.pipe(model);
        const stream = await chain.stream({adjective: "funny", content: "chickens"});
        for await (const response of stream) {
            console.log(response);
            assert.notStrictEqual(response, "");
        }
	});
    test('Simple coding prompt', async() => {
        const model = new NodeLlamaCpp({ modelPath:LLAMA2_PATH, temperature: 0.7 });
        const promptText = "Suggest code where {{<NEW CODE>}} is placed:\n"
        +"Source Code To update:\nint add(int a, int b) {{\n{{<NEW CODE>}}\n}}\n"
        +"Suggested Code:\n<1>\nreturn a + b;\n<2>\nint result = a + b;\nreturn result;\n"
        +"Source Code To update:\n{prev}{{<NEW CODE>}}{post}\nSuggested Code:\n";
        
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: ["prev", "post"],
            template: promptText,});

        const chain = multipleInputPrompt.pipe(model);
        const stream = await chain.stream({prev: "int minus(", post: ""});
        for await (const response of stream) {
            console.log(response);
            assert.notStrictEqual(response, "");
        }
    });

});

aSuite.tests.forEach((t) => {
    t.timeout(120000);
});