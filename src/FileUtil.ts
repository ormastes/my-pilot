const fs = require('fs');
const path = require('path');

const vscode = require('vscode');

function getWorkspaceFolderPath() {
  // Check if there is any folder open in VSCode
  if (vscode.workspace.workspaceFolders) {
    // Get the path of the first workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    return workspaceFolder;
  } else {
    // No folder is open
    vscode.window.showErrorMessage('No workspace folder is open.');
    return '';
  }
}

// Example usage
const workspaceFolderPath = getWorkspaceFolderPath();
console.log(workspaceFolderPath);


function printDirectoryStructure(dirPath: string, prefix = '') {
  const files = fs.readdirSync(dirPath);

  files.forEach((file: string, index: number) => {
    const filePath = path.join(dirPath, file);
    const isLast = index === files.length - 1;
    const newPrefix = prefix + (isLast ? '    ' : '|   ');

    console.log(prefix + (prefix ? '|-- ' : '') + file);

    if (fs.statSync(filePath).isDirectory()) {
      printDirectoryStructure(filePath, newPrefix);
    }
  });
}

// Example usage:
//const directoryPath = '/path/to/your/directory';
printDirectoryStructure(workspaceFolderPath);
