'use strict';

import {vscode} from "./wrappers/vscode";
import {fs} from "./wrappers/fs";
import {lcovParse} from "./wrappers/lcov-parse";
import {ExtensionContext, window} from "vscode";

import {Lcov, lcov} from "./lcov";
import {Indicators, indicators} from "./indicators";
import {Config, configStore} from "./config";

const vscodeImpl = new vscode();
const fsImpl = new fs();
const parseImpl = new lcovParse();

export class Gutters {
    private configStore: configStore;
    private lcov: lcov;
    private indicators: indicators;

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
        } catch(e) {
            console.log(e);
        }
    }

    public dispose() {
        vscodeImpl.setDecorations(this.configStore.coverageDecorationType, []);
        vscodeImpl.setDecorations(this.configStore.gutterDecorationType, []);
    }
}