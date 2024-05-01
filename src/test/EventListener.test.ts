import * as assert from 'assert';
import * as vscode from 'vscode';

const {LlmProvider, LlmType} = require('../LlmProvider');
const { MyEventListener } = require('../EventListener');
const { Message, Position, MessageType } = require('../Message');



const aSuite = suite('EventListener.ts Test Suite', () => {
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
        const responseContent = await response;
        assert.notEqual(responseContent, null);
        assert.notEqual(responseContent, "");
        console.log(responseContent);
	}));

});


aSuite.tests.forEach((t) => {
    t.timeout(120000);
});