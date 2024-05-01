import * as assert from 'assert';
import * as vscode from 'vscode';

const {LlmProvider, LlmType} = require('../LlmProvider');
const { MyEventListener } = require('../EventListener');
const { Message, Position, MessageType } = require('../Message');
const { ResponseCache } = require('../ResponseCache');



const aSuite = suite('ResponseCache.ts Test Suite', () => {
    // set timeout
	vscode.window.showInformationMessage('Start all tests.');

	test('Simple', (async() => {
        const llmProvider = new LlmProvider(LlmType.FakeLLM,{
            responses: ["ready", "```cpp\n\treturn a + b;\n```"],
            sleep: 10,
        });
        const chain = await llmProvider.getChain();
        const listener = new MyEventListener(chain);
        const msg = new Message(new Position(1, 0), 
            "int add(int a, int b) {\n",
            "\n}\n",
             "");
        const response = listener.sendMessage(msg);
        assert.notEqual(listener.processing, null);
        await response;
        const responses = listener.responseCache.get(msg);
        assert.notEqual(responses, null);
        assert.equal(responses[0], "\treturn a + b;\n");
        console.log(responses);
	}));

    test('Additional typing exist', (async() => {
        const llmProvider = new LlmProvider(LlmType.FakeLLM,{
            responses: ["ready", "```cpp\n\treturn a + b;\n```"],
            sleep: 10,
        });
        const chain = await llmProvider.getChain();
        const listener = new MyEventListener(chain);
        const msg = new Message(new Position(1, 0), 
            "int add(int a, int b) {\n",
            "\n}\n",
             "");
        const response = listener.sendMessage(msg);
        assert.notEqual(listener.processing, null);
        await response;
        const inlineMsg = new Message(new Position(1, 3), 
            "int add(int a, int b) {\n\tre",
            "\n}\n",
             "");
        const responses = listener.responseCache.get(inlineMsg);
        assert.notEqual(responses, null);
        assert.equal(responses[0], "turn a + b;\n");
        console.log(responses);
	}));

    test('Deletion exist', (async() => {
        const llmProvider = new LlmProvider(LlmType.FakeLLM,{
            responses: ["ready", "```cpp\n\treturn a + b;\n```"],
            sleep: 10,
        });
        const chain = await llmProvider.getChain();
        const listener = new MyEventListener(chain);
        const msg = new Message(new Position(1, 0), 
            "int add(int a, int b) {\n",
            "\n}\n",
             "");
        const response = listener.sendMessage(msg);
        assert.notEqual(listener.processing, null);
        await response;
        const inlineMsg = new Message(new Position(0, "int add(int a, int b) {" .length-1), 
            "int add(int a, int b) {",
            "\n}\n",
            "");
        const responses = listener.responseCache.get(inlineMsg);
        assert.notEqual(responses, null);
        assert.equal(responses[0], "\n\treturn a + b;\n");
        console.log(responses);
	}));

});


aSuite.tests.forEach((t) => {
    t.timeout(120000);
});