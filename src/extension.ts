import * as Sentry from "@sentry/node";
import { v4 as uuidv4 } from "uuid";
import * as vscode from "vscode";
import { Coverage } from "./coverage-system/coverage";
import { Config } from "./extension/config";
import { emptyLastCoverage, getLastCoverageLines } from "./extension/exportsapi";
import { Gutters } from "./extension/gutters";
import { StatusBarToggler } from "./extension/statusbartoggler";

export function activate(context: vscode.ExtensionContext) {
    const telemetry = vscode.workspace.getConfiguration("telemetry");
    const enableCrashReporting = telemetry.get("enableCrashReporter");
    if (enableCrashReporting) {
        // Leaving default integrations on captures crashes from other extension hosts
        // Turning this off fixes that issue and still allows us to capture errors manually
        Sentry.init({
            defaultIntegrations: false,
            dsn: "https://dfd1a0d586284b6b8710feef8a2928b3@o412074.ingest.sentry.io/5288283",
            release: "vscode-coverage-gutters@2.6.0",
        });
        Sentry.configureScope(function(scope) {
            // Generate a random string for this session
            // Note: for privacy reason, we cannot fingerprint across sessions
            scope.setUser({id: uuidv4()});
        });
    }

    const configStore = new Config(context);
    const statusBarToggler = new StatusBarToggler(configStore);
    const coverage = new Coverage(configStore);
    const outputChannel = vscode.window.createOutputChannel("coverage-gutters");
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

    // return exports api functions
    return {
        emptyLastCoverage,
        getLastCoverageLines,
    };
}
