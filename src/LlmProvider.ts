
const { OpenAI } = require("@langchain/openai");
const { FakeListLLM } = require( "langchain/llms/fake");
const { NodeLlamaCpp, ModelPath } = require("./NodeLlamaCpp");
const { PromptTemplate } = require('@langchain/core/prompts');
const { TemplateTool } = require('./TemplateTool');

//import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

// OPENAI_API_KEY get from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// list llm in OpenAI, FakeLLM, StartCoder2
export enum LlmType  {
    OPENAI = "OPENAI",
    FakeLLM = "FakeLLM",
    Llama2 = "Llama2",
    StartCoder2 = "StartCoder2",
};

export class LlmProvider {
    private llm: any; // You should replace 'any' with the actual type of LLMs
    private chain: any;
  
    constructor(private llm_type: LlmType, private input:any = {}) {
      this.clear();
    }
    clear() {
      this.llm = null;
      this.chain = null; 
    }
  
    getLlm(): any { // Replace 'any' with the actual return type
      if (!this.llm) {
        switch (this.llm_type) {
          case LlmType.OPENAI:
            if (this.input.modelName == null) this.input.modelName = "gpt-3.5-turbo-instruct";
            if (this.input.openAIApiKey == null) this.input.openAIApiKey = OPENAI_API_KEY;
            if (this.input.temperature == null) this.input.temperature = 0.9;
            this.llm = new OpenAI(this.input);
            break;
          case LlmType.FakeLLM:
            if (this.input.responses == null) this.input.responses = ["This is a test response", "This is another test response"];
            this.llm = new FakeListLLM(this.input);
            break;
          case LlmType.StartCoder2:
            if (this.input.modelPath == null) this.input.modelPath = ModelPath.STARCODER2_PATH;
            if (this.input.temperature == null) this.input.temperature = 0.9;
            this.llm = new NodeLlamaCpp(this.input);
            break;
          case LlmType.Llama2:
            if (this.input.modelPath == null) this.input.modelPath = ModelPath.LLAMA2_PATH;
            if (this.input.temperature == null) this.input.temperature = 0.9;
            this.llm = new NodeLlamaCpp(this.input);
            break;
          default:
            this.llm = null;
            break;
        }
      }
      return this.llm;
    }

    getChain(): any {
      if (this.chain != null) return this.chain;
      try {
      
        var model = this.getLlm();
        var chain = model.call("You are a coding assistant. Ready?").then((response:any)=>{
          console.log("Model loaded.", response);
    
          const multipleInputPrompt = new PromptTemplate({
            inputVariables: TemplateTool.inputVariables,
            template: TemplateTool.promptText,});
    
          this.chain = multipleInputPrompt.pipe(model);
          return this.chain;
  
        });
        return chain;
      }catch (e) {
        console.error(e);
        throw e;
      }
    }
}
