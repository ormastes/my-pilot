import * as vscode from 'vscode';
import { Range } from 'vscode';
import { InlineCompletionItem } from 'vscode';
import { InlineCompletionList } from 'vscode';
import { ProviderResult } from 'vscode';
import { CompletionList } from 'vscode';


class MyIlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {
    isCursorInMiddleOfWord(document: vscode.TextDocument, position: vscode.Position) {
        const lineText = document.lineAt(position.line).text;
        const cursorIndex = position.character;
      
        // Define a regex for word characters
        const wordCharacterRegex = /[\p{L}\p{N}_]/u;
        // In this regex:
        //  \p{L} matches any kind of letter from any language.
        //  \p{N} matches any kind of numeric character in any script.
        //  _ matches the underscore character.
        //  The u flag enables Unicode mode, which allows the regex to correctly handle Unicode characters.
    
      
        // Initialize indices for the start and end of the word
        let startIndex = cursorIndex;
        let endIndex = cursorIndex;
      
        // Find the start of the current word (if any)
        while (startIndex > 0 && wordCharacterRegex.test(lineText[startIndex - 1])) {
          startIndex--;
        }
      
        // Find the end of the current word (if any)
        while (endIndex < lineText.length && wordCharacterRegex.test(lineText[endIndex])) {
          endIndex++;
        }
      
        // Extract the current word
        const currentWord = lineText.substring(startIndex, endIndex);
      
        // Check if the cursor is in the middle of a word
        const isInMiddleOfWord = startIndex !== endIndex && startIndex !== cursorIndex && endIndex !== cursorIndex;
      
        // Return the current word and indices, or an empty string and the cursor index if not in the middle of a word
        return isInMiddleOfWord
          ? { word: currentWord, leftIndex: startIndex, rightIndex: endIndex }
          : { word: '', leftIndex: cursorIndex, rightIndex: cursorIndex };
    }
    async provideInlineCompletionItems(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        context: vscode.InlineCompletionContext, 
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        
        console.log('provideInlineCompletionItems triggered');
        const insertRange = new vscode.Range(position.line, position.character, position.line, position.character);
        const inlineCompletionItem = new vscode.InlineCompletionItem("hello===========================================");
        inlineCompletionItem.range = insertRange;
        inlineCompletionItem.command = {
            command: 'my-pilot.command1',
            title: 'My Inline Completion Demo Command',
            arguments: [1, 2],
            tooltip: 'My Inline Completion Demo Command Tooltip'
        };

        // Since we're returning a single item, wrap it in an InlineCompletionList
        return new vscode.InlineCompletionList([inlineCompletionItem]);
    }

    handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
        console.log('handleDidShowCompletionItem');
    }
    resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): ProviderResult<vscode.CompletionItem> {
        console.log('resolveCompletionItem');
        return item;
    }

}
const inlineCompletionProvider = new MyIlineCompletionItemProvider();
export { inlineCompletionProvider };