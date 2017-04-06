import * as vscode from "vscode";
import {Gutters} from "./gutters";
import {Reporter} from "./reporter";

export function activate(context: vscode.ExtensionContext) {
    const reporter = new Reporter();
    let gutters = new Gutters(context, reporter);

    let display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    let watchLcovFile = vscode.commands.registerCommand("extension.watchLcovFile", () => {
        gutters.watchLcovFile();
    });

    let remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.removeCoverageForActiveFile();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watchLcovFile);
    context.subscriptions.push(gutters);
}
