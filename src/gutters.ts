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

import {Vscode} from "./wrappers/vscode";

import {IConfigStore} from "./config";
import {Coverage} from "./coverage";
import {CoverageService} from "./coverageservice";
import {Indicators} from "./indicators";
import {Reporter} from "./reporter";
import {StatusBarToggler} from "./statusbartoggler";

const vscodeImpl = new Vscode();

export class Gutters {
    private configStore: IConfigStore;
    private coverageWatcher: FileSystemWatcher;
    private editorWatcher: Disposable;
    private statusBarItem: StatusBarItem;
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private indicators: Indicators;
    private reporter: Reporter;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;

    constructor(
        configStore: IConfigStore,
        coverage: Coverage,
        indicators: Indicators,
        outputChannel: OutputChannel,
        reporter: Reporter,
        statusBar: StatusBarToggler,
    ) {
        this.configStore = configStore;
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.indicators = indicators;
        this.statusBar = statusBar;
        this.reporter = reporter;

        this.coverageService = new CoverageService(
            configStore,
            this.outputChannel,
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

            this.outputChannel.appendLine("Preview coverage report displayed");
            this.reporter.sendEvent("user", "preview-coverage-report");
        } catch (error) {
            this.handleError(error);
        }
    }

    public async displayCoverageForActiveFile() {
        await this.coverageService.displayForFile();
    }

    public async watchCoverageAndVisibleEditors() {
        await this.coverageService.watchWorkspace();
    }

    public removeWatch() {
        try {
            this.coverageWatcher.dispose();
            this.editorWatcher.dispose();
            this.coverageWatcher = null;
            this.editorWatcher = null;
            this.statusBar.toggle();
            this.removeCoverageForActiveFile();

            this.reporter.sendEvent("user", "remove-watch");
        } catch (error) {
            if (error.message === "Cannot read property 'dispose' of undefined") { return ; }
            if (error.message === "Cannot read property 'dispose' of null") { return ; }
            this.handleError(error);
        }
    }

    public removeCoverageForActiveFile() {
        const activeEditor = window.activeTextEditor;
        this.removeDecorationsForTextEditor(activeEditor);

        this.reporter.sendEvent("user", "remove-coverage");
    }

    public dispose() {
        this.coverageWatcher.dispose();
        this.editorWatcher.dispose();
        this.statusBar.dispose();

        this.reporter.sendEvent("cleanup", "dispose");
    }

    private handleError(error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        window.showWarningMessage(message.toString());
        this.outputChannel.appendLine(`Error: ${message}`);
        this.outputChannel.appendLine(`Stacktrace: ${stackTrace}`);
        this.reporter.sendEvent(
            "error",
            message.toString(),
            stackTrace ? stackTrace.toString() : undefined,
        );
    }

    private removeDecorationsForTextEditor(textEditor: TextEditor) {
        if (!textEditor) { return; }
        textEditor.setDecorations(this.configStore.fullCoverageDecorationType, []);
        textEditor.setDecorations(this.configStore.partialCoverageDecorationType, []);
        textEditor.setDecorations(this.configStore.noCoverageDecorationType, []);
    }

    private async loadAndRenderCoverage(textEditor: TextEditor, coveragePath: string): Promise<void> {
        if (!textEditor.document) { return ; }
        const coverageFile = await this.coverage.load(coveragePath);
        const file = textEditor.document.fileName;
        const coveredLines = await this.indicators.extractCoverage(coverageFile, file);
        await this.indicators.renderToTextEditor(coveredLines, textEditor);
        this.reporter.sendEvent("user", "coverageFileType", coverageFile.includes("<?xml") ? "xml" : "info");
    }

    private renderCoverageOnVisible(coveragePath: string) {
        window.visibleTextEditors.forEach(async (editor) => {
            if (!editor) { return; }
            await this.loadAndRenderCoverage(editor, coveragePath);
        });
    }
}
