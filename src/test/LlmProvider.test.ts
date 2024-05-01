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


const aSuite = suite('LlmProvider Test Suite', () => {
    // set timeout
	vscode.window.showInformationMessage('Start all tests.');

	test('load model from url', (() => {
        const filePromise = LlmProvider.flieDownload("https://huggingface.co/second-state/StarCoder2-15B-GGUF/resolve/main/starcoder2-15b-Q4_K_M.gguf");
	}));

});

aSuite.tests.forEach((t) => {
    t.timeout(200000);
});