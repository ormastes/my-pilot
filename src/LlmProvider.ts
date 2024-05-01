
const { OpenAI } = require("@langchain/openai");
const { FakeListLLM } = require( "langchain/llms/fake");
const { NodeLlamaCpp, ModelPath } = require("./NodeLlamaCpp");
const { PromptTemplate } = require('@langchain/core/prompts');
const { TemplateTool } = require('./TemplateTool');
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
import path from 'path';

// OPENAI_API_KEY get from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// list llm in OpenAI, FakeLLM, StartCoder2
export enum LlmType  {
    OPENAI = "OPENAI",
    FakeLLM = "FakeLLM",
    Llama2 = "Llama2",
    Llama3 = "Llama3",
    StartCoder2 = "StartCoder2",
};

export class LlmProvider {
    private llm: any; // You should replace 'any' with the actual type of LLMs
    private llm_path: any;
    private chain: any;
  
    constructor(private llm_type: any, private input:any = {}) {
      this.clear();
      
    }
    clear() {
      this.llm = null;
      this.chain = null;
      this.llm_path = null; 
    }
    static flieDownload(llm_url:string): Promise<unknown> {
      if (llm_url !== null) {

        let fileName = llm_url.split('/').pop();
        // modelpath from this script file
        let modelPath = `../models/${fileName}`;
        let inputFile = path.join(__dirname, modelPath)
        if (fs.existsSync(inputFile)) {
          return Promise.resolve(inputFile);
        }
        // download model from url to modelPath
        const file = fs.createWriteStream(inputFile);
        let that = this;
        let result = new Promise((resolve, reject) =>  {
          const request = https.get(llm_url, function(response:any) {
            response.pipe(file); 
            response.on('end', function() {
              file.close();
              resolve(modelPath);
            });
            response.on('close', function() {
              console.log('Response closed');
            });
          }).on('error', reject);
        });
        return result;
      }
      return Promise.resolve(null);
    }

    getLlmPath(): any {
      if (this.input.llm_url != null) {

        let fileName = this.input.llm_url.split('/').pop();
        // modelpath from this script file
        this.input.modelPath = `../models/${fileName}`;
        let inputFile = path.join(__dirname, this.input.modelPath)
        if (fs.existsSync(inputFile)) {
          return Promise.resolve(inputFile);
        }
        // download model from url to modelPath
        const file = fs.createWriteStream(inputFile);
        let that = this;
        let result = new Promise((resolve, reject) => {
          const request = https.get(this.input.llm_url, function(response:any) {
            response.pipe(file); 
            response.on('end', function() {
              file.close();
              resolve(that.input.modelPath);
              that.llm_path = that.input.modelPath;
            });
            response.on('close', function() {
              console.log('Response closed');
            });
          }).on('error', reject);
        });
        return result;
      }
      return Promise.resolve(this.input.modelPath);
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

    async getChain(): Promise<any> {
      if (this.chain != null) return this.chain;
      try {
        var path = await this.getLlmPath();
        var model = this.getLlm();
        var response = await model.call("You are a coding assistant. Ready?");
        console.log("Model loaded.", response);
    
        const multipleInputPrompt = new PromptTemplate({
          inputVariables: TemplateTool.inputVariables,
          template: TemplateTool.promptText,});
  
        this.chain = multipleInputPrompt.pipe(model);
        return this.chain;

      }catch (e) {
        console.error(e);
        throw e;
      }
    }
}
