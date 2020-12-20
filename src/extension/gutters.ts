import * as Sentry from "@sentry/node";
import {
    OutputChannel,
    Uri,
    ViewColumn,
    window,
    workspace,
} from "vscode";
import { Coverage } from "../coverage-system/coverage";
import { CoverageService } from "../coverage-system/coverageservice";
import { Config } from "./config";
import { StatusBarToggler } from "./statusbartoggler";

export class Gutters {
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;

    constructor(
        configStore: Config,
        coverage: Coverage,
        outputChannel: OutputChannel,
        statusBar: StatusBarToggler,
    ) {
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.statusBar = statusBar;

        this.coverageService = new CoverageService(
            configStore,
            this.outputChannel,
            statusBar,
        );
    }

    public async previewCoverageReport() {
        try {
            const coverageReports = await this.coverage.findReports();
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
        } catch (error) {
            this.handleError("previewCoverageReport", error);
        }
    }

    public async displayCoverageForActiveFile() {
        try {
            await this.coverageService.displayForFile();
        } catch (error) {
            this.handleError("displayCoverageForActiveFile", error);
        }
    }

    public async watchCoverageAndVisibleEditors() {
        try {
            this.statusBar.toggle(true);
            await this.coverageService.watchWorkspace();
        } catch (error) {
            this.handleError("watchCoverageAndVisibleEditors", error);
        }
    }

    public removeWatch() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
            this.statusBar.toggle(false);
            this.coverageService.dispose();
        } catch (error) {
            this.handleError("removeWatch", error, false);
        }
    }

    public removeCoverageForActiveFile() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
        } catch (error) {
            this.handleError("removeCoverageForActiveFile", error, false);
        }
    }

    public dispose() {
        try {
            this.coverageService.dispose();
            this.statusBar.dispose();
        } catch (error) {
            this.handleError("dispose", error, false);
        }
    }

    private handleError(area: string, error: Error, showMessage: boolean = true) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        if (showMessage) {
            window.showWarningMessage(message.toString());
        }
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${stackTrace}`);

        // Only send crash reports if the user allows this from their global settings.
        const telemetry = workspace.getConfiguration("telemetry");
        const enableCrashReporting = telemetry.get("enableCrashReporter");
        if (enableCrashReporting) {
            const sentryId = Sentry.captureException(error);
            const sentryPrompt = "Please post this in the github issue if you submit one. Sentry Event ID:";
            this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${sentryPrompt} ${sentryId}`);
        }
    }
}
