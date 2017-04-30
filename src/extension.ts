import * as vscode from "vscode";
import {Gutters} from "./gutters";
import {Reporter} from "./reporter";
import {Request} from "./wrappers/request";
import {Uuid} from "./wrappers/uuid";

export function activate(context: vscode.ExtensionContext) {
    const enableMetrics = vscode.workspace.getConfiguration("telemetry").get("enableTelemetry") as boolean;
    const reporter = new Reporter(new Request(), new Uuid(), "", enableMetrics);
    const gutters = new Gutters(context, reporter);

    const display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    const watch = vscode.commands.registerCommand("extension.watchLcovAndVisibleEditors", () => {
        gutters.watchLcovAndVisibleEditors();
    });

    const removeWatch = vscode.commands.registerCommand("extension.removeWatch", () => {
        gutters.removeWatch();
    });

    const remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.removeCoverageForActiveFile();
    });

    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watch);
    context.subscriptions.push(removeWatch);
    context.subscriptions.push(gutters);
}
