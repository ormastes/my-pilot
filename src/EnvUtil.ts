const vscode = require('vscode');

async function createFileDictionary() {
  let fileDictionary = {};
  for (const tabGroup of vscode.window.tabGroups.all) {
    for (const tab of tabGroup.tabs) {
      if (tab.isTextEditor && tab.input instanceof vscode.FileInput) {
        const document = await vscode.workspace.openTextDocument(tab.input.uri);
        //fileDictionary[tab.input.uri.path] = document.getText();
      }
    }
  }
  return fileDictionary;
}

// Example usage:
createFileDictionary().then(fileDictionary => {
  console.log(fileDictionary);
});


function getActiveTabName() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      return activeEditor.document.fileName;
    } else {
      return 'No active editor';
    }
  }
  
  // Example usage:
  const activeTabName = getActiveTabName();
  console.log(activeTabName)