import * as vscode from "vscode";
import {Gutters} from "./gutters";
import {Reporter} from "./reporter";

export function activate(context: vscode.ExtensionContext) {
    const optOutMetrics = vscode.workspace.getConfiguration("telemetry").get("enableTelemetry") as boolean;
    const reporter = new Reporter(optOutMetrics);
    const gutters = new Gutters(context, reporter);

    const display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    const watchLcovFile = vscode.commands.registerCommand("extension.watchLcovFile", () => {
        gutters.watchLcovFile();
    });

    const remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.removeCoverageForActiveFile();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watchLcovFile);
    context.subscriptions.push(gutters);
}
