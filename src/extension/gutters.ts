import {
    commands,
    Disposable,
    FileSystemWatcher,
    OutputChannel,
    StatusBarItem,
    TextEditor,
    Uri,
    version,
    ViewColumn,
    window,
} from "vscode";

import {Coverage} from "../coverage-system/coverage";
import {CoverageService} from "../coverage-system/coverageservice";
import {IConfigStore} from "./config";
import {Reporter} from "./reporter";
import {StatusBarToggler} from "./statusbartoggler";

export class Gutters {
    private configStore: IConfigStore;
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private reporter: Reporter;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;

    constructor(
        configStore: IConfigStore,
        coverage: Coverage,
        outputChannel: OutputChannel,
        reporter: Reporter,
        statusBar: StatusBarToggler,
    ) {
        this.configStore = configStore;
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.statusBar = statusBar;
        this.reporter = reporter;

        this.coverageService = new CoverageService(
            configStore,
            this.outputChannel,
            this.reporter,
        );

        this.reporter.sendEvent("user", "start");
        this.reporter.sendEvent("user", "vscodeVersion", version);
    }

    public async previewCoverageReport() {
        try {
            const coverageReports = await this.coverage.findReports();
            this.reporter.sendEvent("user", "preview-coverage-report-findCoverageFiles", `${coverageReports.length}`);
            const pickedReport = await this.coverage.pickFile(
                coverageReports,
                "Choose a Coverage Report to preview.",
            );
            if (!pickedReport) { throw new Error("Could not show Coverage Report file!"); }
            const reportUri = Uri.file(pickedReport.toString());
            await commands.executeCommand(
                "vscode.previewHtml",
                reportUri,
                ViewColumn.One,
                "Preview Coverage Report",
            );

            this.reporter.sendEvent("user", "preview-coverage-report");
        } catch (error) {
            this.handleError(error);
        }
    }

    public async displayCoverageForActiveFile() {
        try {
            await this.coverageService.displayForFile();
            this.reporter.sendEvent("user", "display-coverage");
        } catch (error) {
            this.handleError(error);
        }
    }

    public async watchCoverageAndVisibleEditors() {
        try {
            this.statusBar.toggle();
            await this.coverageService.watchWorkspace();
            this.reporter.sendEvent("user", "watch-coverage-editors");
        } catch (error) {
            this.handleError(error);
        }
    }

    public removeWatch() {
        this.coverageService.removeCoverageForCurrentEditor();
        this.coverageService.dispose();
        this.statusBar.toggle();

        this.reporter.sendEvent("user", "remove-watch");
    }

    public removeCoverageForActiveFile() {
        this.coverageService.removeCoverageForCurrentEditor();
        this.reporter.sendEvent("user", "remove-coverage");
    }

    public dispose() {
        this.coverageService.dispose();
        this.statusBar.dispose();

        this.reporter.sendEvent("cleanup", "dispose");
    }

    private handleError(error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        window.showWarningMessage(message.toString());
        this.outputChannel.appendLine(`[${Date.now()}][gutters]: Error ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][gutters]: Stacktrace ${stackTrace}`);
        this.reporter.sendEvent(
            "error",
            message.toString(),
            stackTrace ? stackTrace.toString() : undefined,
        );
    }
}
