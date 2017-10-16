import * as vscode from "vscode";
import {Config} from "./config";
import {Gutters} from "./gutters";
import {Indicators} from "./indicators";
import {Coverage} from "./coverage";
import {Reporter} from "./reporter";
import {StatusBarToggler} from "./statusbartoggler";
import {Fs} from "./wrappers/fs";
import {Glob} from "./wrappers/glob";
import {XmlParse} from "./wrappers/xml-parse";
import {LcovParse} from "./wrappers/lcov-parse";
import {Request} from "./wrappers/request";
import {Vscode} from "./wrappers/vscode";

const fsImpl = new Fs();
const xmlParseImpl = new XmlParse();
const lcovParseImpl = new LcovParse();
const vscodeImpl = new Vscode();
const globImpl = new Glob();

export function activate(context: vscode.ExtensionContext) {
    const enableMetrics = vscode.workspace.getConfiguration("telemetry").get("enableTelemetry") as boolean;
    const reporter = new Reporter(new Request(), vscode.env.machineId, "", enableMetrics);
    const configStore = new Config(vscodeImpl, context, reporter).get();
    const statusBarToggler = new StatusBarToggler(configStore);
    const coverage = new Coverage(configStore, globImpl, vscodeImpl, fsImpl);
    const indicators = new Indicators(xmlParseImpl, lcovParseImpl, vscodeImpl, configStore);
    const gutters = new Gutters(
        configStore,
        coverage,
        indicators,
        reporter,
        statusBarToggler,
    );

    const previewCoverageReport = vscode.commands.registerCommand("extension.previewCoverageReport", () => {
        gutters.previewCoverageReport();
    });

    const display = vscode.commands.registerCommand("extension.displayCoverage", () => {
        gutters.displayCoverageForActiveFile();
    });

    const watch = vscode.commands.registerCommand("extension.watchCoverageAndVisibleEditors", () => {
        gutters.watchCoverageAndVisibleEditors();
    });

    const removeWatch = vscode.commands.registerCommand("extension.removeWatch", () => {
        gutters.removeWatch();
    });

    const remove = vscode.commands.registerCommand("extension.removeCoverage", () => {
        gutters.removeCoverageForActiveFile();
    });

    context.subscriptions.push(previewCoverageReport);
    context.subscriptions.push(remove);
    context.subscriptions.push(display);
    context.subscriptions.push(watch);
    context.subscriptions.push(removeWatch);
    context.subscriptions.push(gutters);
}
