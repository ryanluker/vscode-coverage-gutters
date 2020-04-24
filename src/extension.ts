import * as vscode from "vscode";
import { Coverage } from "./coverage-system/coverage";
import { Config } from "./extension/config";
import { emptyLastCoverage, getLastCoverageLines } from "./extension/exportsapi";
import { Gutters } from "./extension/gutters";
import { Reporter } from "./extension/reporter";
import { StatusBarToggler } from "./extension/statusbartoggler";

export function activate(context: vscode.ExtensionContext) {
    const enableMetrics = vscode.workspace.getConfiguration("telemetry").get("enableTelemetry") as boolean;
    const reporter = new Reporter(vscode.env.machineId, enableMetrics);
    const configStore = new Config(context, reporter);
    const statusBarToggler = new StatusBarToggler(configStore);
    const coverage = new Coverage(configStore);
    const outputChannel = vscode.window.createOutputChannel("coverage-gutters");
    const gutters = new Gutters(
        configStore,
        coverage,
        outputChannel,
        reporter,
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

    // return exports api functions
    return {
        emptyLastCoverage,
        getLastCoverageLines,
    };
}
