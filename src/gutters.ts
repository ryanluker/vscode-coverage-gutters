import {
    commands,
    Disposable,
    FileSystemWatcher,
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
    private indicators: Indicators;
    private reporter: Reporter;
    private statusBar: StatusBarToggler;

    constructor(
        configStore: IConfigStore,
        coverage: Coverage,
        indicators: Indicators,
        reporter: Reporter,
        statusBar: StatusBarToggler,
    ) {
        this.configStore = configStore;
        this.coverage = coverage;
        this.indicators = indicators;
        this.statusBar = statusBar;
        this.reporter = reporter;

        this.reporter.sendEvent("user", "start");
        this.reporter.sendEvent("user", "vscodeVersion", version);
    }

    public async previewCoverageReport() {
        try {
            const coverageReports = await this.coverage.findReports();
            let pickedReport: string;
            if (coverageReports.length === 1) {
                pickedReport = coverageReports[0];
            } else {
                this.reporter.sendEvent("user", "showQuickPickReport", `${coverageReports.length}`);
                pickedReport = await window.showQuickPick(
                    coverageReports,
                    {placeHolder: "Choose a Coverage Report to preview."},
                );
            }

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
        const textEditor = window.activeTextEditor;
        try {
            if (!textEditor) { return; }
            const filePaths = await this.coverage.findCoverageFiles();
            const pickedFile = await this.coverage.pickFile(
                filePaths,
                "Choose a file to use for coverage.",
            );
            if (!pickedFile) { throw new Error("Could not show coverage for file!"); }

            await this.loadAndRenderCoverage(textEditor, pickedFile);
            this.reporter.sendEvent("user", "display-coverage");
        } catch (error) {
            this.handleError(error);
        }
    }

    public async watchCoverageAndVisibleEditors() {
        if (this.coverageWatcher && this.editorWatcher) { return; }

        const textEditor = window.activeTextEditor;
        try {
            const filePaths = await this.coverage.findCoverageFiles();
            const pickedFile = await this.coverage.pickFile(
                filePaths,
                "Choose a file to use for coverage.",
            );
            if (!pickedFile) { throw new Error("Could not show coverage for file!"); }

            // When we try to load the coverage when watch is actived we dont want to error
            // if the active file has no coverage
            this.loadAndRenderCoverage(textEditor, pickedFile).catch(() => {});

            this.coverageWatcher = vscodeImpl.watchFile(pickedFile);
            this.coverageWatcher.onDidChange((event) => this.renderCoverageOnVisible(pickedFile));
            this.editorWatcher = window.onDidChangeVisibleTextEditors(
                (event) => this.renderCoverageOnVisible(pickedFile));
            this.statusBar.toggle();

            this.reporter.sendEvent("user", "watch-coverage-editors");
        } catch (error) {
            this.handleError(error);
        }
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
        window.showWarningMessage(message.toString());
        this.reporter.sendEvent("error", message.toString());
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
