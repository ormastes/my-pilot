
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { InlineCompletionItem } from 'vscode';
import { InlineCompletionList } from 'vscode';
import { ProviderResult } from 'vscode';
import { CompletionList } from 'vscode';
import { ResponseCache } from './ResponseCache';

const { Message, MessageType, Position } = require('./Message');
const { TemplateTool } = require('./TemplateTool');

enum EventTypes {
    TEXT_CHANGE = 'TEXT_CHANGE',
    CURSOR_CHANGE = 'CURSOR_CHANGE',
    ACTIVE_EDITOR_CHANGE = 'ACTIVE_EDITOR_CHANGE',
    INLINE_COMPLETION = 'INLINE_COMPLETION'
}

export class MyEventListener implements vscode.InlineCompletionItemProvider {
    subscriptions: any[];
    pending: typeof Message[]; // Fix: Change the type of 'pending' property
    processing: Promise<any> | null;
    responseCache: ResponseCache;
    currentSymbol: any;

    constructor(private chain: any) {
        this.subscriptions = [];
        this.processing = null;
        this.pending = [];
        this.currentSymbol = null;
        this.responseCache = new ResponseCache();
    }
    activate() {
        this.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event )=>{this._onEvent(EventTypes.TEXT_CHANGE, event);}));
        this.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event )=>{this._onEvent(EventTypes.CURSOR_CHANGE, event);}));
        this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((event)=>{this._onDocumentChange(event);}));
        this.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, this));
    }

    dispose() {
        this.subscriptions.forEach((disposable: any) => {
            disposable.dispose();
        });
    }
    
    setProcessing(msg: typeof Message) : Promise<typeof Message>|null {
        this.processing = this.chain.invoke({prev:msg.prev, post:msg.next}).then(
            (response:any) =>  {
                if (response == null) return null;
                console.log('llm response:', response);
                let msg = this.pending[0];
                let responseList = TemplateTool.parseResponse(response);
                console.log('llm responseList:', responseList);
                if (responseList.length == 0) return null;
                msg.setContents(responseList);
                if (this.pending.length == 1) {
                    this.pending = [];
                    this.processing = null;
                } else {
                    let last = this.pending.pop();
                    this.pending = [last];
                    this.processing = msg;
                }
                this.responseCache.add(msg);
                return msg;
        });
        return this.processing;
    }

    sendMessage(msg: typeof Message) : Promise<typeof Message>|null {
        this.pending.push(msg);
        if (this.processing != null) {
            return null;
        }
        return this.setProcessing(msg);
    }

    async getDocumentSymbols(editor: vscode.TextEditor) {
        const document = editor.document;
    
        // Retrieve all symbols from the document
        const symbols = await vscode.commands.executeCommand(
                'vscode.executeDocumentSymbolProvider',
                document.uri
            );
        return symbols;
    }
  
    _onDocumentChange(event: any) {
        this.currentSymbol = this.getDocumentSymbols(event.textEditor);
    }

    _onEvent(eventType: EventTypes, event: any) {
        console.log(eventType, event);
        if (event==null) return;
        let document = null;
        let selection = null;
        if (eventType == EventTypes.TEXT_CHANGE) {
            document = event.document;
            if (event.contentChanges.length == 0) return;
            selection = event.contentChanges[0].range;
        } else if (eventType == EventTypes.CURSOR_CHANGE) {
            let textEditor = event.textEditor;
            if (textEditor == null) return;
            document = textEditor.document;
            if (event.selections.length == 0) return;
            selection = event.selections[0];
        } 
        console.log('document:', document);
        console.log('selection:', selection);

        let line = selection.c.c;
        let character = selection.c.e;
        console.log('line:', line, 'character:', character);
        console.log('document:', document.getText());

        let message = Message.createConciseMessage(document, new Position(line, character), []);
        
        this.sendMessage(message);
        return;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        context: vscode.InlineCompletionContext, 
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        console.log('provideInlineCompletionItems');

        let message = Message.createConciseMessage(document, new Position(position.line, position.character), []);
        let response = this.responseCache.get(message);
        let range = new Range(position.line, position.character, position.line, position.character);
        if (response != null && response.length != 0) {
            return this.makeResponses(response, range);
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