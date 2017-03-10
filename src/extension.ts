'use strict';

import * as vscode from "vscode";
import {Gutters} from "./gutters";


export function activate(context: vscode.ExtensionContext) {
    console.log("Loaded coverage-gutters!");

    let gutters = new Gutters(vscode.workspace.rootPath);

    let disposable = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForFile(vscode.window.activeTextEditor.document.fileName);
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(gutters);
}