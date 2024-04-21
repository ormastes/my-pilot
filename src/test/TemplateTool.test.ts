import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
const {NodeLlamaCpp,LLAMA2_PATH } = require('../NodeLlamaCpp');
const { PromptTemplate } = require('@langchain/core/prompts');
const {setTestModel} = require('../extension');
const { TemplateTool } = require('../TemplateTool');
const { FakeListLLM } = require( "langchain/llms/fake");

const aSuite = suite('TemplateTool.ts Test Suite', () => {
    // set timeout
	vscode.window.showInformationMessage('Start all tests.');

	test('Simple parse', (() => {
        let parsed = TemplateTool.parseResponse("1.\n```cpp\n a\n```\n2.\n```cpp\n b\n```");
        // compare with [" a", " b"]
        assert.strictEqual(parsed.length, 2);
        assert.strictEqual(parsed[0], " a\n");
        assert.strictEqual(parsed[1], " b\n");
	}));

    test('Parse 3 elementes', (() => {
        let parsed = TemplateTool.parseResponse("1.\n```cpp\n a\n```\n2.\n```cpp\n b\n```\n3.\n```cpp\n c\n```\n");
        // compare with [" a", " b", " c"]
        assert.strictEqual(parsed.length, 3);
        assert.strictEqual(parsed[0], " a\n");
        assert.strictEqual(parsed[1], " b\n");
        assert.strictEqual(parsed[2], " c\n");
	}));

    test('Parse 1 element', (() => {
        let parsed = TemplateTool.parseResponse("```cpp\n\treturn a + b;\n```");
        assert.strictEqual(parsed.length, 1);
        assert.strictEqual(parsed[0], "\treturn a + b;\n");
    }));

    test('Parse 0 element', (() => {
        let parsed = TemplateTool.parseResponse(" a\n b\n");
        assert.strictEqual(parsed.length, 0);
    }));

    test('Examples', (() => {
        let toParse ="1.\n"+
        "```cpp\n"+
        "        return a - b;\n"+
        "```\n"+
        "2.\n"+
        "```cpp\n"+
        "        int result = a - b;\n"+
        "        return result;\n"+
        "```\n"+
        "\n"+
        "3.\n"+
        "```cpp\n"+
        "        int diff = a - b;\n"+
        "        return diff;\n"+
        "```"
        let parsed = TemplateTool.parseResponse(toParse);
        assert.strictEqual(parsed.length, 3);
        for (let i = 0; i < 3; i++) {
            // check "```" is not included
            assert.strictEqual(parsed[i].includes("```"), false);
        }
    }));
    test('Examples one simple', (() => {
        let toParse =
        "```cpp\n"+
        "        return a - b;\n"+
        "```\n";
        let parsed = TemplateTool.parseResponse(toParse);
        assert.strictEqual(parsed.length, 1);
        for (let i = 0; i < 1; i++) {
            // check "```" is not included
            assert.strictEqual(parsed[i].includes("```"), false);
        }
    }));

});
setTestModel(new FakeListLLM({
    responses: ['aaa', 'bbb', 'ccc'],
  }));
