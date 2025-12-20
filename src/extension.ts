import * as vscode from "vscode";
import { Coverage } from "./coverage-system/coverage";
import {
    BranchCoverageCodeLensProvider,
    BranchCoverageHoverProvider,
} from "./coverage-system/branchcoverageproviders";
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

    // Register branch coverage providers
    const branchCodeLensProvider = new BranchCoverageCodeLensProvider();
    const branchHoverProvider = new BranchCoverageHoverProvider();

    const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
        { scheme: "file" },
        branchCodeLensProvider,
    );

    const hoverProviderDisposable = vscode.languages.registerHoverProvider(
        { scheme: "file" },
        branchHoverProvider,
    );

    // Pass providers to gutters so they can be updated when coverage changes
    gutters.setProviders(branchCodeLensProvider, branchHoverProvider);

    const previewCoverageReport = vscode.commands.registerCommand(
        "coverage-gutters.previewCoverageReport",
        gutters.previewCoverageReport.bind(gutters),
    );
    const display = vscode.commands.registerCommand(
        "coverage-gutters.displayCoverage",
        gutters.displayCoverageForActiveFile.bind(gutters),
    );
    const toggle = vscode.commands.registerCommand(
        "coverage-gutters.toggleCoverage",
        gutters.toggleCoverageForActiveFile.bind(gutters),
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
    context.subscriptions.push(toggle);
    context.subscriptions.push(watch);
    context.subscriptions.push(removeWatch);
    context.subscriptions.push(gutters);
    context.subscriptions.push(outputChannel);
    context.subscriptions.push(codeLensProviderDisposable);
    context.subscriptions.push(hoverProviderDisposable);

    if (configStore.watchOnActivate) {
        gutters.watchCoverageAndVisibleEditors();
    }
}
