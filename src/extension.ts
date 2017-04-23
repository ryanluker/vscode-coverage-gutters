import * as vscode from "vscode";
import {Gutters} from "./gutters";
import {Reporter} from "./reporter";
import {Request} from "./wrappers/request";
import {Uuid} from "./wrappers/uuid";

export function activate(context: vscode.ExtensionContext) {
    const enableMetrics = vscode.workspace.getConfiguration("telemetry").get("enableTelemetry") as boolean;
    const reporter = new Reporter(new Request(), new Uuid(), enableMetrics);
    const gutters = new Gutters(context, reporter);

    const display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    const watchLcovFile = vscode.commands.registerCommand("extension.watchLcovFile", () => {
        gutters.watchLcovFile();
    });

    const watchVisibleEditors = vscode.commands.registerCommand("extension.watchVisibleEditors", () => {
        gutters.watchVisibleEditors();
    });

    const remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.removeCoverageForActiveFile();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watchLcovFile);
    context.subscriptions.push(watchVisibleEditors);
    context.subscriptions.push(gutters);
}
