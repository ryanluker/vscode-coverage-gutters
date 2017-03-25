import * as vscode from "vscode";
import {Gutters} from "./gutters";

export function activate(context: vscode.ExtensionContext) {
    let gutters = new Gutters(context);

    let display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    let remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.dispose();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(gutters);
}
