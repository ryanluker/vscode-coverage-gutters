import {
    ExtensionContext,
    FileSystemWatcher,
    TextEditor,
    window,
} from "vscode";

import {Fs} from "./wrappers/fs";
import {LcovParse} from "./wrappers/lcov-parse";
import {Vscode} from "./wrappers/vscode";

import {Config, IConfigStore} from "./config";
import {Indicators} from "./indicators";
import {Lcov} from "./lcov";
import {Reporter} from "./reporter";

const vscodeImpl = new Vscode();
const fsImpl = new Fs();
const parseImpl = new LcovParse();

export class Gutters {
    private configStore: IConfigStore;
    private lcovWatcher: FileSystemWatcher;
    private lcov: Lcov;
    private indicators: Indicators;
    private reporter: Reporter;

    constructor(context: ExtensionContext, reporter: Reporter) {
        this.configStore = new Config(vscodeImpl, context, reporter).setup();
        this.lcov = new Lcov(this.configStore, vscodeImpl, fsImpl);
        this.indicators = new Indicators(parseImpl, vscodeImpl, this.configStore);
        this.reporter = reporter;
        this.reporter.sendEvent("user", "start");
    }

    public async displayCoverageForActiveFile() {
        const textEditor = window.activeTextEditor;
        try {
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(textEditor, lcovPath);
            this.reporter.sendEvent("user", "display-coverage");
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Watch the lcov file and iterate over textEditors when changes occur
     */
    public async watchLcovFile() {
        if (this.lcovWatcher) { return; }

        try {
            const lcovPath = await this.lcov.find();
            this.lcovWatcher = vscodeImpl.watchFile(lcovPath);
            this.lcovWatcher.onDidChange(async (event) => {
                window.visibleTextEditors.forEach(async (editor) => {
                    await this.loadAndRenderCoverage(editor, lcovPath);
                });
            });
            this.reporter.sendEvent("user", "watch-lcov");
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Watch the visible editors and render coverage when changes occur
     */
    public async watchVisibleEditors() {
        try {
            const lcovPath = await this.lcov.find();
            window.onDidChangeVisibleTextEditors(async (event) => {
                window.visibleTextEditors.forEach(async (editor) => {
                    await this.loadAndRenderCoverage(editor, lcovPath);
                });
            });
            this.reporter.sendEvent("user", "watch-editors");
        } catch (error) {
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
        this.reporter.sendEvent("cleanup", "dispose");
    }

    private handleError(error: Error) {
        const message = error.message ? error.message : error;
        window.showWarningMessage(message.toString());
        this.reporter.sendEvent("error", message.toString());
    }

    private removeDecorationsForTextEditor(editor: TextEditor) {
        if (!editor) { return; }
        editor.setDecorations(this.configStore.fullCoverageDecorationType, []);
        editor.setDecorations(this.configStore.partialCoverageDecorationType, []);
        editor.setDecorations(this.configStore.noCoverageDecorationType, []);
    }

    private async loadAndRenderCoverage(textEditor: TextEditor, lcovPath: string): Promise<void> {
        const lcovFile = await this.lcov.load(lcovPath);
        const file = textEditor.document.fileName;
        const coveredLines = await this.indicators.extract(lcovFile, file);
        await this.indicators.renderToTextEditor(coveredLines, textEditor);
    }
}
