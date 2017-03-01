'use strict';

import * as vscode from "vscode";
import {Gutters} from "./gutters";

let gutters = new Gutters();

export function activate(context: vscode.ExtensionContext) {
    console.log("Loaded coverage-gutters!");

    let disposable = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForFile(vscode.window.activeTextEditor.document.fileName);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    gutters.removeIndicators();
}