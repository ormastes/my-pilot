/*
import * as assert from 'assert';
import * as vscode from 'vscode';
import { OpenAI } from '@langchain/openai';
import { LlmProvider, LlmType } from "../LlmProvider";
//const { LlamaCpp } = require("@langchain/community/llms/llama_cpp");
//import { LlamaCpp } from       '@langchain/community/llms/llama_cpp';


suite('OpenAI Test', () => {

	test('Simple Call', async () => {
    const provider = new LlmProvider(LlmType.FakeLLM);
    provider.responseList = ["This is a test response"];
    const model = provider.getLlm();
		const res = await model.invoke(
            "What would be a good company name a company that makes colorful socks?"
    );
    console.log({ res });
    // check not empty
    assert.notStrictEqual(res, "");
	});
  test('Local lamma2', async () => {
    const llamaPath = "./model/llama-2-13b.Q6_K.gguf";
    const question = "Where do Llamas come from?";
    //const model = new LlamaCpp({ modelPath: llamaPath });
    console.log(`You: ${question}`);
    //const response = await model.invoke(question);
    //console.log(`AI : ${response}`);
    //assert.notStrictEqual(response, "");
  });
});*/
