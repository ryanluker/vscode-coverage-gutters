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
    private fileWatcher: FileSystemWatcher;
    private lcov: Lcov;
    private indicators: Indicators;
    private reporter: Reporter;
    private textEditors: TextEditor[];

    constructor(context: ExtensionContext, reporter: Reporter) {
        this.configStore = new Config(vscodeImpl, context, reporter).setup();
        this.lcov = new Lcov(this.configStore, vscodeImpl, fsImpl);
        this.indicators = new Indicators(parseImpl, vscodeImpl, this.configStore);
        this.reporter = reporter;
        this.textEditors = [];
        this.reporter.sendEvent("user", "start");
    }

    public async displayCoverageForActiveFile() {
        const textEditor = window.activeTextEditor;
        this.addTextEditorToCache(textEditor);
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
        if (this.fileWatcher) { return; }

        try {
            const lcovPath = await this.lcov.find();
            this.fileWatcher = vscodeImpl.watchFile(lcovPath);
            this.fileWatcher.onDidChange(async (event) => {
                this.textEditors.forEach(async (editor) => {
                    if (!editor.document) {
                        // editor can no longer display coverage, remove from cache
                        this.removeTextEditorFromCache(editor);
                    } else {
                        this.loadAndRenderCoverage(editor, lcovPath);
                    }
                });
            });
            this.reporter.sendEvent("user", "watch-lcov");
        } catch (error) {
            this.handleError(error);
        }
    }

    public removeCoverageForActiveFile() {
        const activeEditor = window.activeTextEditor;
        this.removeTextEditorFromCache(activeEditor);
        this.removeDecorationsForTextEditor(activeEditor);
        this.reporter.sendEvent("user", "remove-coverage");
    }

    public dispose() {
        this.fileWatcher.dispose();
        this.textEditors.forEach(this.removeDecorationsForTextEditor);
        this.reporter.sendEvent("cleanup", "dispose");
    }

    public getTextEditors(): TextEditor[] {
        return this.textEditors;
    }

    private handleError(error: Error) {
        const message = error.message ? error.message : error;
        window.showErrorMessage(message.toString());
        this.reporter.sendEvent("error", message.toString());
    }

    private addTextEditorToCache(editor: TextEditor) {
        // keep textEditors a unique array by removing existing editors
        this.textEditors = this.textEditors.filter((cache) => cache !== editor);
        this.textEditors.push(editor);
    }

    private removeTextEditorFromCache(editor: TextEditor) {
        this.textEditors = this.textEditors.filter((cache) => cache !== editor);
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
