import {ExtensionContext, window} from "vscode";
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
    private lcov: InterfaceLcov;
    private indicators: InterfaceIndicators;

    constructor(context: ExtensionContext) {
        this.configStore = new Config(vscodeImpl, context).setup();
        this.lcov = new Lcov(this.configStore, vscodeImpl, fsImpl);
        this.indicators = new Indicators(parseImpl, vscodeImpl, this.configStore);
    }

    public async displayCoverageForActiveFile() {
        try {
            const activeFile = window.activeTextEditor.document.fileName;
            const lcovPath = await this.lcov.find();
            const lcovFile = await this.lcov.load(lcovPath);
            const coveredLines = await this.indicators.extract(lcovFile, activeFile);
            await this.indicators.render(coveredLines);
        } catch (e) {
            console.error(e);
        }
    }

    public dispose() {
        vscodeImpl.setDecorations(this.configStore.coverageDecorationType, []);
        vscodeImpl.setDecorations(this.configStore.gutterDecorationType, []);
    }
}
