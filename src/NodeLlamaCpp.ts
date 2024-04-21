// async-wrapper.cjs
// https://github.com/langchain-ai/langchainjs/blob/d6e25af137873493d30bdf5732d46b842e421ffa/langchain-core/src/language_models/llms.ts#L557
// https://github.com/langchain-ai/langchainjs/blob/d6e25af137873493d30bdf5732d46b842e421ffa/langchain-core/src/callbacks/manager.ts

/* 
public constructor({
        modelPath, seed = null, contextSize = 1024 * 4, batchSize, gpuLayers,
        threads = 6, temperature = 0, topK = 40, topP = 0.95, logitsAll, vocabOnly, useMmap, useMlock, embedding
    }: LlamaModelOptions) 
*/

import path from 'path';
async function loadModule() {
    const { LlamaModel, LlamaContext, LlamaChatSession } = await import('node-llama-cpp');
    return { LlamaModel, LlamaContext, LlamaChatSession };
}

const { LLM } = require('@langchain/core/language_models/llms')
const {CallbackManagerForLLMRun} = require('@langchain/core/callbacks/manager')

enum ModelPath {
    LLAMA2_PATH = "../models/llama-2-13b.Q6_K.gguf",
    STARCODER2_PATH = "../models/starcoder2-15b-Q6_K.gguf",
}


class NodeLlamaCpp extends LLM {
    model: any;
    context: any;
    session: any;
    inited: any;
    constructor(params: any) {
        super(params);
        var that = this;
        this.inited = loadModule().then(({LlamaModel, LlamaContext, LlamaChatSession}:any)=>{
            var model = new LlamaModel({ modelPath: path.join(__dirname, params.modelPath), temperature: params.temperature });
            var context = new LlamaContext({model});
            var session = new LlamaChatSession({context});
            that.model = model;
            that.context = context;
            that.session = session;
            return session;
        });
    }
    _llmType(): string{
        return "llama_cpp";
    }
    async _call(
        prompt: string,
        options: this["ParsedCallOptions"],
        runManager?: any
        ): Promise<string> {
        return this._simpleCall(prompt);
    }
    async _waitInit(): Promise<any> {
        // wait until model is loaded
        return await this.inited.then((session:any)=>{
            return session;
        });
    }
    _simpleCall(prompt: string): string {
        console.log("Prompt: ", prompt);
        if (!this.session) {
            var initedResult  = this.inited;
            var promptResult  = initedResult.then((session:any)=>{
                const result = session.prompt(prompt);
                return result;
            });
            var stringResult = promptResult.then((response:any)=>{
                return response;
            });

            return stringResult;
        }

        // Now that we know the session is initialized, we can use it
        try {
            var result = this.session.prompt(prompt);
            return result;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

export {
    NodeLlamaCpp,
    ModelPath
};

