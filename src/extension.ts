import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let cssVars: string[] = [];

  vscode.workspace.onDidOpenTextDocument(loadCssVariables);
  vscode.workspace.onDidSaveTextDocument(loadCssVariables);
  loadCssVariables();

  async function loadCssVariables() {
    const files = await vscode.workspace.findFiles("**/_corporate-theme.*");
    if (files.length === 0) {
      return;
    }

    const doc = await vscode.workspace.openTextDocument(files[0]);
    cssVars = Array.from(extractCssVariables(doc.getText()));
  }

  function extractCssVariables(fileContent: string): Set<string> {
    const regex = /--[^:;]+(?=:)/g;
    const matches = fileContent.match(regex);
    return new Set(matches);
  }

  const provider = vscode.languages.registerCompletionItemProvider(
    ["css", "sass", "scss", "postcss"],
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        return cssVars.map(
          (varName) =>
            new vscode.CompletionItem(
              varName,
              vscode.CompletionItemKind.Variable
            )
        );
      },
    }
  );

  context.subscriptions.push(provider);
}
