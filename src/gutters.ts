import {
    Disposable,
    FileSystemWatcher,
    StatusBarItem,
    TextEditor,
    version,
    window,
} from "vscode";

import {Vscode} from "./wrappers/vscode";

import {IConfigStore} from "./config";
import {Indicators} from "./indicators";
import {Lcov} from "./lcov";
import {Reporter} from "./reporter";
import {StatusBarToggler} from "./statusbartoggler";

const vscodeImpl = new Vscode();

export class Gutters {
    private configStore: IConfigStore;
    private lcovWatcher: FileSystemWatcher;
    private editorWatcher: Disposable;
    private statusBarItem: StatusBarItem;
    private lcov: Lcov;
    private indicators: Indicators;
    private reporter: Reporter;
    private statusBar: StatusBarToggler;

    constructor(
        configStore: IConfigStore,
        lcov: Lcov,
        indicators: Indicators,
        reporter: Reporter,
        statusBar: StatusBarToggler,
    ) {
        this.configStore = configStore;
        this.lcov = lcov;
        this.indicators = indicators;
        this.statusBar = statusBar;
        this.reporter = reporter;

        this.reporter.sendEvent("user", "start");
        this.reporter.sendEvent("user", "vscodeVersion", version);
    }

    public async displayCoverageForActiveFile() {
        const textEditor = window.activeTextEditor;
        try {
            if (!textEditor) { return; }
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(textEditor, lcovPath);

            this.reporter.sendEvent("user", "display-coverage");
        } catch (error) {
            this.handleError(error);
        }
    }

    public async watchLcovAndVisibleEditors() {
        if (this.lcovWatcher && this.editorWatcher) { return; }

        const textEditor = window.activeTextEditor;
        try {
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(textEditor, lcovPath);

            this.lcovWatcher = vscodeImpl.watchFile(lcovPath);
            this.lcovWatcher.onDidChange((event) => this.renderCoverageOnVisible(lcovPath));
            this.editorWatcher = window.onDidChangeVisibleTextEditors(
                (event) => this.renderCoverageOnVisible(lcovPath));
            this.statusBar.toggle();

            this.reporter.sendEvent("user", "watch-lcov-editors");
        } catch (error) {
            this.handleError(error);
        }
    }

    public removeWatch() {
        try {
            this.lcovWatcher.dispose();
            this.editorWatcher.dispose();
            this.lcovWatcher = null;
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
        this.lcovWatcher.dispose();
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

    private async loadAndRenderCoverage(textEditor: TextEditor, lcovPath: string): Promise<void> {
        const lcovFile = await this.lcov.load(lcovPath);
        const file = textEditor.document.fileName;
        const coveredLines = await this.indicators.extract(lcovFile, file);
        await this.indicators.renderToTextEditor(coveredLines, textEditor);
    }

    private renderCoverageOnVisible(lcovPath: string) {
        window.visibleTextEditors.forEach(async (editor) => {
            if (!editor) { return; }
            await this.loadAndRenderCoverage(editor, lcovPath);
        });
    }
}
