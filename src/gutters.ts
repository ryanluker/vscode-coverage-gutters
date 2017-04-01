import {
    ExtensionContext,
    FileSystemWatcher,
    TextEditor,
    window,
} from "vscode";
import {Fs} from "./wrappers/fs";
import {LcovParse} from "./wrappers/lcov-parse";
import {Vscode} from "./wrappers/vscode";

import {Config, ConfigStore} from "./config";
import {Indicators, InterfaceIndicators} from "./indicators";
import {InterfaceLcov, Lcov} from "./lcov";

const vscodeImpl = new Vscode();
const fsImpl = new Fs();
const parseImpl = new LcovParse();

export class Gutters {
    private configStore: ConfigStore;
    private fileWatcher: FileSystemWatcher;
    private lcov: InterfaceLcov;
    private indicators: InterfaceIndicators;
    private textEditors: TextEditor[];

    constructor(context: ExtensionContext) {
        this.configStore = new Config(vscodeImpl, context).setup();
        this.lcov = new Lcov(this.configStore, vscodeImpl, fsImpl);
        this.indicators = new Indicators(parseImpl, vscodeImpl, this.configStore);
        this.textEditors = [];
    }

    public async displayCoverageForActiveFile() {
        const textEditor = window.activeTextEditor;
        this.addTextEditorToCache(textEditor);
        try {
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(textEditor, lcovPath);
        } catch (e) {
            console.log(e);
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
        } catch (e) {
            console.log(e);
        }
    }

    public removeCoverageForActiveFile() {
        const activeEditor = window.activeTextEditor;
        this.removeTextEditorFromCache(activeEditor);
        this.removeDecorationsForTextEditor(activeEditor);
    }

    public dispose() {
        this.fileWatcher.dispose();
        this.textEditors.forEach(this.removeDecorationsForTextEditor);
    }

    public getTextEditors(): TextEditor[] {
        return this.textEditors;
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
