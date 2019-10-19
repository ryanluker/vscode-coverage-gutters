import {
    OutputChannel,
    Uri,
    version,
    ViewColumn,
    window,
    workspace,
} from "vscode";

import { Coverage } from "../coverage-system/coverage";
import { CoverageService } from "../coverage-system/coverageservice";
import { Config } from "./config";
import { Reporter } from "./reporter";
import { StatusBarToggler } from "./statusbartoggler";

export class Gutters {
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private reporter: Reporter;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;

    constructor(
        configStore: Config,
        coverage: Coverage,
        outputChannel: OutputChannel,
        reporter: Reporter,
        statusBar: StatusBarToggler,
    ) {
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.statusBar = statusBar;
        this.reporter = reporter;

        this.coverageService = new CoverageService(
            configStore,
            this.outputChannel,
            this.reporter,
        );

        this.reporter.sendEvent("user", "start", version, 1);
    }

    public async previewCoverageReport() {
        try {
            const coverageReports = await this.coverage.findReports();
            this.reporter.sendEvent(
                "user",
                "preview-coverage-report-findCoverageFiles",
                `${coverageReports.length}`,
            );
            const pickedReport = await this.coverage.pickFile(
                coverageReports,
                "Choose a Coverage Report to preview.",
            );
            if (!pickedReport) { throw new Error("Could not show Coverage Report file!"); }

            // Construct the webview panel for the coverage report to live in
            const previewPanel = window.createWebviewPanel(
                "coverageReportPreview",
                "Preview Coverage Report",
                ViewColumn.One,
            );

            // Read in the report html and send it to the webview
            const reportUri = Uri.file(pickedReport);
            const reportHtml = await workspace.openTextDocument(reportUri);
            previewPanel.webview.html = reportHtml.getText();

            this.reporter.sendEvent("user", "preview-coverage-report", undefined, 25);
        } catch (error) {
            this.handleError("previewCoverageReport", error);
        }
    }

    public async displayCoverageForActiveFile() {
        try {
            await this.coverageService.displayForFile();
            this.reporter.sendEvent("user", "display-coverage", undefined, 50);
        } catch (error) {
            this.handleError("displayCoverageForActiveFile", error);
        }
    }

    public async watchCoverageAndVisibleEditors() {
        try {
            this.statusBar.toggle(true);
            await this.coverageService.watchWorkspace();
            this.reporter.sendEvent("user", "watch-coverage-editors", undefined, 75);
        } catch (error) {
            this.handleError("watchCoverageAndVisibleEditors", error);
        }
    }

    public removeWatch() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
            this.statusBar.toggle(false);
            this.coverageService.dispose();

            this.reporter.sendEvent("user", "remove-watch", undefined, 25);
        } catch (error) {
            this.handleError("removeWatch", error, false);
        }
    }

    public removeCoverageForActiveFile() {
        this.coverageService.removeCoverageForCurrentEditor();
        this.reporter.sendEvent("user", "remove-coverage", undefined, 25);
    }

    public dispose() {
        this.coverageService.dispose();
        this.statusBar.dispose();
        this.reporter.sendEvent("cleanup", "dispose");
    }

    private handleError(area: string, error: Error, showMessage: boolean = true) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        if (showMessage) {
            window.showWarningMessage(message.toString());
        }
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${stackTrace}`);
        this.reporter.sendEvent(
            "error",
            message.toString(),
            stackTrace ? stackTrace.toString() : undefined,
        );
    }
}
