'use strict';

import * as vscode from "vscode";
import {Gutters} from "./gutters";


export function activate(context: vscode.ExtensionContext) {
    console.log("Loaded coverage-gutters!");

    let gutters = new Gutters(vscode.workspace.rootPath);

    let display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForFile(vscode.window.activeTextEditor.document.fileName);
    });

    let remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.dispose();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(gutters);
}