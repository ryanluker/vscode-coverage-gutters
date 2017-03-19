'use strict';

import {
    createTextEditorDecorationType,
    executeCommand,
    getConfiguration,
    setDecorations,
    findFiles
} from "./wrappers/vscode";
import {readFile} from "./wrappers/fs";
import {lcovParse} from "./wrappers/lcov-parse";
import {Range, window} from "vscode";

import {Lcov, lcov} from "./lcov";
import {Indicators, indicators} from "./indicators";
import {Config, configStore} from "./config";

export class Gutters {
    private configStore: configStore;
    private lcov: lcov;
    private indicators: indicators;

    constructor() {
        this.configStore = new Config(createTextEditorDecorationType, executeCommand, getConfiguration).setup();
        this.lcov = new Lcov(this.configStore, findFiles, readFile);
        this.indicators = new Indicators(this.configStore, lcovParse, setDecorations);
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
        setDecorations(this.configStore.coverageDecorationType, []);
    }
}