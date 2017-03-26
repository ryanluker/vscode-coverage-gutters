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
        this.textEditors.push(textEditor);
        try {
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(textEditor, lcovPath);
        } catch (e) {
            console.error(e);
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
                    this.loadAndRenderCoverage(editor, lcovPath);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }

    public removeCoverageForActiveFile() {
        const activeEditor = window.activeTextEditor;
        this.textEditors = this.textEditors.filter((editor) => editor !== activeEditor);
        activeEditor.setDecorations(this.configStore.coverageDecorationType, []);
        activeEditor.setDecorations(this.configStore.gutterDecorationType, []);
    }

    public dispose() {
        this.fileWatcher.dispose();
        this.textEditors.forEach(function(editor) {
            editor.setDecorations(this.configStore.coverageDecorationType, []);
            editor.setDecorations(this.configStore.gutterDecorationType, []);
        });
    }

    private async loadAndRenderCoverage(textEditor: TextEditor, lcovPath: string): Promise<void> {
        const lcovFile = await this.lcov.load(lcovPath);
        const file = textEditor.document.fileName;
        const coveredLines = await this.indicators.extract(lcovFile, file);
        await this.indicators.renderToTextEditor(coveredLines, textEditor);
    }
}
