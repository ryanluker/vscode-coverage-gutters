'use strict';

import * as vscode from "vscode";
import * as parse from "lcov-parse";

export function activate(context: vscode.ExtensionContext) {
    console.log("Loaded coverage-gutters!");

    let disposable = vscode.commands.registerCommand("extension.displayCoverage", () => {
        //instantiate new gutters object
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    //remove coverage indicators
}