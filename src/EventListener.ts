
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { InlineCompletionItem } from 'vscode';
import { InlineCompletionList } from 'vscode';
import { ProviderResult } from 'vscode';
import { CompletionList } from 'vscode';


const { FakeListLLM } = require("langchain/llms/fake");
const {NodeLlamaCpp, LLAMA2_PATH} = require('./NodeLlamaCpp');
const { PromptTemplate } = require('@langchain/core/prompts');


export class MyEventListener implements vscode.InlineCompletionItemProvider {
    subscriptions: any[];
    constructor(private getResponse: any, private sendMessage: any) {
        this.subscriptions = [];
    }
    activate() {
        this.subscriptions.push(vscode.workspace.onDidChangeTextDocument(this._onCursorChange));
        this.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(this._onTextChange));  
        this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this._onActiveEditorChange));
        this.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, this));
    }

    dispose() {
        this.subscriptions.forEach((disposable: any) => {
            disposable.dispose();
        });
    }

    _onCursorChange(event: any) {
        this.sendMessage(event);
        console.log('cursor changed', event);
    }
    _onTextChange(event: any) {
        this.sendMessage(event);
        console.log('text changed', event);
    }
    _onActiveEditorChange(event: any) {
        console.log('active editor changed', event);
    }
    async provideInlineCompletionItems(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        context: vscode.InlineCompletionContext, 
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        console.log('provideInlineCompletionItems');
        let response = this.getResponse();
        if (response != null && response.response.trim().length != 0) {
            let insertRange = new vscode.Range(response.position.line, response.position.character, response.position.line, response.position.character);
            return this.makeResponses([response.response], insertRange);
        }
        return [];
    }
    handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
        console.log('handleDidShowCompletionItem');
    }
    resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): ProviderResult<vscode.CompletionItem> {
        console.log('resolveCompletionItem');
        return item;
    }
    makeResponses(responses: string[], insertRange:Range) :  vscode.InlineCompletionList{
        let inlineCompletionItems: vscode.InlineCompletionItem[] = [];
        for (let response of responses) {
            const inlineCompletionItem = new vscode.InlineCompletionItem(response);
            inlineCompletionItem.range = insertRange;
            inlineCompletionItems.push(inlineCompletionItem);
        }
        return new vscode.InlineCompletionList(inlineCompletionItems);
    }
}