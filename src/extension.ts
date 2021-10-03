import * as vscode from "vscode";
import { Coverage } from "./coverage-system/coverage";
import { Config } from "./extension/config";
import { Gutters } from "./extension/gutters";
import { StatusBarToggler } from "./extension/statusbartoggler";

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("coverage-gutters");
    const configStore = new Config(context);
    const statusBarToggler = new StatusBarToggler(configStore);
    const coverage = new Coverage(configStore);
    const gutters = new Gutters(
        configStore,
        coverage,
        outputChannel,
        statusBarToggler,
    );

    const previewCoverageReport = vscode.commands.registerCommand(
        "coverage-gutters.previewCoverageReport",
        gutters.previewCoverageReport.bind(gutters),
    );
    const display = vscode.commands.registerCommand(
        "coverage-gutters.displayCoverage",
        gutters.displayCoverageForActiveFile.bind(gutters),
    );
    const watch = vscode.commands.registerCommand(
        "coverage-gutters.watchCoverageAndVisibleEditors",
        gutters.watchCoverageAndVisibleEditors.bind(gutters),
    );
    const removeWatch = vscode.commands.registerCommand(
        "coverage-gutters.removeWatch",
        gutters.removeWatch.bind(gutters),
    );
    const remove = vscode.commands.registerCommand(
        "coverage-gutters.removeCoverage",
        gutters.removeCoverageForActiveFile.bind(gutters),
    );

    context.subscriptions.push(previewCoverageReport);
    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watch);
    context.subscriptions.push(removeWatch);
    context.subscriptions.push(gutters);
    context.subscriptions.push(outputChannel);
}
