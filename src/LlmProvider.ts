
const { OpenAI } = require("@langchain/openai");
const { FakeListLLM } = require( "langchain/llms/fake");

//import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

// OPENAI_API_KEY get from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// list llm in OpenAI, FakeLLM, StartCoder2
export enum LlmType  {
    OPENAI,
    FakeLLM,
    Llama2,
    StartCoder2
};

export class LlmProvider {
    private _llm_type: LlmType;
    private _llm: any; // You should replace 'any' with the actual type of LLMs
    public responseList: any[]; // Replace 'any' with the actual type of responses
  
    constructor(llm: LlmType) {
      this._llm_type = llm;
      this.responseList = [];
    }
  
    getLlm(): any { // Replace 'any' with the actual return type
      if (!this._llm) {
        switch (this._llm_type) {
          case LlmType.OPENAI:
            this._llm = new OpenAI({
              modelName: "gpt-3.5-turbo-instruct", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
              temperature: 0.9,
              openAIApiKey: OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
            });
            break;
          case LlmType.FakeLLM:
            this._llm = new FakeListLLM({
              responses: this.responseList,
            });
            break;
          case LlmType.StartCoder2:
            this._llm = null;
            break;
          default:
            this._llm = null;
            break;
        }
      }
      return this._llm;
    }
}
