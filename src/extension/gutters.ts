import { OutputChannel, window } from "vscode";
import { Coverage } from "../coverage-system/coverage";
import { CoverageService } from "../coverage-system/coverageservice";
import { Config } from "./config";
import { CrashReporter } from "./crashreporter";
import { StatusBarToggler } from "./statusbartoggler";
import { PreviewPanel } from "./webview";

export class Gutters {
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;
    private crashReporter: CrashReporter;

    constructor(
        configStore: Config,
        coverage: Coverage,
        outputChannel: OutputChannel,
        statusBar: StatusBarToggler,
        crashReporter: CrashReporter,
    ) {
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.statusBar = statusBar;
        this.crashReporter = crashReporter;

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
            if (!pickedReport) {
                window.showWarningMessage("Could not show Coverage Report file!");
                return;
            }
            const previewPanel = new PreviewPanel(pickedReport);
            await previewPanel.createWebView();
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
            this.handleError("removeWatch", error);
        }
    }

    public removeCoverageForActiveFile() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
        } catch (error) {
            this.handleError("removeCoverageForActiveFile", error);
        }
    }

    public dispose() {
        try {
            this.coverageService.dispose();
            this.statusBar.dispose();
        } catch (error) {
            this.handleError("dispose", error);
        }
    }

    private handleError(area: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${stackTrace}`);
        this.crashReporter.sendErrorEvent(area, error);
    }
}
