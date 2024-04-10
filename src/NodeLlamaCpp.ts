// async-wrapper.cjs
// https://github.com/langchain-ai/langchainjs/blob/d6e25af137873493d30bdf5732d46b842e421ffa/langchain-core/src/language_models/llms.ts#L557
// https://github.com/langchain-ai/langchainjs/blob/d6e25af137873493d30bdf5732d46b842e421ffa/langchain-core/src/callbacks/manager.ts
import path from 'path';
async function loadModule() {
    const { LlamaModel, LlamaContext, LlamaChatSession } = await import('node-llama-cpp');
    return { LlamaModel, LlamaContext, LlamaChatSession };
}

const { LLM } = require('@langchain/core/language_models/llms')
const {CallbackManagerForLLMRun} = require('@langchain/core/callbacks/manager')
const llamaPath = "../models/llama-2-13b.Q6_K.gguf";
class NodeLlamaCpp extends LLM {
    model: any;
    constructor(params: any) {
        super(params);
        loadModule().then(({LlamaModel}:any)=>{
            this.model = new LlamaModel({ modelPath: path.join(__dirname,llamaPath), temperature: 0.7 });
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
        return this.model.run(prompt);
    }    
}
const LlamaCpp = new NodeLlamaCpp({ modelPath:llamaPath, temperature: 0.7 });
export {
    NodeLlamaCpp
};

