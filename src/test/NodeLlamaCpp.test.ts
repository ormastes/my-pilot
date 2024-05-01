import * as assert from 'assert';
import * as vscode from 'vscode';
import { LlmProvider, LlmType } from '../LlmProvider';
// import * as myExtension from '../../extension';
const {NodeLlamaCpp,ModelPath } = require('../NodeLlamaCpp');
const { PromptTemplate } = require('@langchain/core/prompts');
const {setTestModel} = require('../extension');
const { TemplateTool } = require('../TemplateTool');
const { FakeListLLM } = require( "langchain/llms/fake");
const { MyEventListener } = require('../EventListener');
const { Message, Position, MessageType } = require('../Message');

const aSuite = suite('Llama.cpp Test Suite', () => {
    // set timeout
	vscode.window.showInformationMessage('Start all tests.');

    setTestModel(new FakeListLLM({
        responses: ['aaa', 'bbb', 'ccc'],
      }));

	test('Init llama model', (() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.LLAMA2_PATH, temperature: 0.7 });
	}));

    test('Init llama model waitInit', (() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.LLAMA2_PATH, temperature: 0.7 });
        return model._waitInit().then((session:any)=>{
            assert.notEqual(session, null);
            return session;
        });
	})); //5 seconds
    test('Init llama model SingleQuery', (() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.LLAMA2_PATH, temperature: 0.7 });
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
        const model = new NodeLlamaCpp({ modelPath: ModelPath.LLAMA2_PATH, temperature: 0.7 });
        return model._simpleCall("Hello llama model").then((response:any)=>{
            assert.notEqual(response, null);
            assert.notEqual(response, "");
            console.log(response);
            return response;
        });
	})); // 27 seconds

    test('Init starcoder model QueryWithoutInit', (() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.STARCODER2_PATH, temperature: 0.7 });
        return model._simpleCall("Hello starcoder model").then((response:any)=>{
            assert.notEqual(response, null);
            assert.notEqual(response, "");
            console.log(response);
            return response;
        });
	}));


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
        const model = new NodeLlamaCpp({ modelPath: ModelPath.LLAMA2_PATH, temperature: 0.7 });
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
    test('Coding prompt stream', async() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.STARCODER2_PATH, temperature: 0.9 });
        
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: TemplateTool.inputVariables,
            template: TemplateTool.promptText,});

        const chain = multipleInputPrompt.pipe(model);
        const stream = await chain.stream({prev: "int minus(int a, int b) {\n\t", post: "\n}\n"});
        for await (const response of stream) {
            console.log("RESPONSE MESSAGE:", response);
            assert.notStrictEqual(response, "");
        }
    });
    test('Coding prompt stream result parse', async() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.STARCODER2_PATH, temperature: 0.9 });
        
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: TemplateTool.inputVariables,
            template: TemplateTool.promptText,});

        const chain = multipleInputPrompt.pipe(model);
        const stream = await chain.stream({prev: "int minus(ini a, int b) {\n", post: "\n}\n"});
        for await (const response of stream) {
            console.log("RESPONSE MESSAGE:", response);
            let result = TemplateTool.parseResponse(response);
            assert.notStrictEqual(result, []);
        }
    });
    test('Coding prompt invoke', async() => {
        const model = new NodeLlamaCpp({ modelPath: ModelPath.STARCODER2_PATH, temperature: 0.9 });
        
        const multipleInputPrompt = new PromptTemplate({
            inputVariables: TemplateTool.inputVariables,
            template: TemplateTool.promptText,});

        const chain = multipleInputPrompt.pipe(model);
        const response = await chain.invoke({prev: "int minus(ini a, int b) {\n", post: "\n}\n"});
        console.log("RESPONSE MESSAGE:", response);
            let result = TemplateTool.parseResponse(response);
            assert.notStrictEqual(result, []);
    });

    test('EventLister Simple Coding', (async() => {
        const llmProvider = new LlmProvider(LlmType.StartCoder2);
        const chain = await llmProvider.getChain();
        const listener = new MyEventListener(chain);
        const msg = new Message(new Position(1, 0), 
            "int add(int a, int b) {\n",
            "\n}\n",
             "");
        const response = listener.sendMessage(msg);
        assert.notEqual(listener.processing, null);
        await response;
        assert.notEqual(listener.response, null);
        assert.notEqual(listener.response.contents.length, 0);
        assert.notEqual(listener.response.contents[0], "");
        console.log(listener.response.content);
	}));

});

aSuite.tests.forEach((t) => {
    t.timeout(200000);
});