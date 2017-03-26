import {
    ExtensionContext,
    FileSystemWatcher,
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

    constructor(context: ExtensionContext) {
        this.configStore = new Config(vscodeImpl, context).setup();
        this.lcov = new Lcov(this.configStore, vscodeImpl, fsImpl);
        this.indicators = new Indicators(parseImpl, vscodeImpl, this.configStore);
    }

    public async displayCoverageForActiveFile() {
        const activeFile = window.activeTextEditor.document.fileName;
        try {
            const lcovPath = await this.lcov.find();
            await this.loadAndRenderCoverage(activeFile, lcovPath);
        } catch (e) {
            console.error(e);
        }
    }

    public async displayCoverageForActiveFileAndWatch() {
        const textEditor = window.activeTextEditor;
        const file = textEditor.document.fileName;
        try {
            const lcovPath = await this.lcov.find();
            this.fileWatcher = vscodeImpl.watchFile(lcovPath);
            await this.loadAndRenderCoverage(file, lcovPath);
            this.fileWatcher.onDidChange(async (event) => {
                const lcovFile = await this.lcov.load(lcovPath);
                const coveredLines = await this.indicators.extract(lcovFile, file);
                await this.indicators.renderToTextEditor(coveredLines, textEditor);
            });
        } catch (e) {
            console.error(e);
        }
    }

    public dispose() {
        this.fileWatcher.dispose();
        vscodeImpl.setDecorations(this.configStore.coverageDecorationType, []);
        vscodeImpl.setDecorations(this.configStore.gutterDecorationType, []);
    }

    private async loadAndRenderCoverage(file, lcovPath): Promise<void> {
        const lcovFile = await this.lcov.load(lcovPath);
        const coveredLines = await this.indicators.extract(lcovFile, file);
        await this.indicators.render(coveredLines);
    }
}
