'use strict';

import * as vscode from "vscode";
import * as parse from "lcov-parse";
import {readFile} from "fs";

export class Gutters {
    private indicators: vscode.Range[];
    private lcovFile: string;
    private workspacePath: string;
    private lcovPath: string;
    private activeEditor: vscode.TextEditor;

    private coverageDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        light: {
            backgroundColor: 'lightgreen',

        },
        dark: {
            backgroundColor: 'darkgreen'
        }
    });

    constructor(workspacePath: string) {
        this.indicators = [];
        this.workspacePath = workspacePath;
        this.lcovPath = this.workspacePath + "/coverage/lcov.info";
        this.activeEditor = vscode.window.activeTextEditor;
    }

    public async displayCoverageForFile(file: string) {
        let lcovFile = await this.loadLcov();
        let coveredLines = await this.findFileAndExtractCoverage(lcovFile, file);
        let indicators = await this.renderIndicators(coveredLines);
    }

    public dispose() {
        this.activeEditor.setDecorations(this.coverageDecorationType, []);
    }

    public getLcovPath(): string {
        return this.lcovPath;
    }

    public getWorkspacePath(): string {
        return this.workspacePath;
    }

    public getIndicators(): Object[] {
        return this.indicators;
    }

    private renderIndicators(lines: Detail[]): Promise<Array<vscode.Range>> {
        return new Promise<Array<Object>>((resolve, reject) => {
            let renderLines = lines.map((detail) => {
                return new vscode.Range(detail.line - 1, 0, detail.line - 1, 0);
            });
            this.activeEditor.setDecorations(this.coverageDecorationType, renderLines);
            return resolve(renderLines);
        });
    }

    private loadLcov() {
        return new Promise<string>((resolve, reject) => {
            readFile(this.lcovPath, (err, data) => {
                if(err) return reject(err);
                return resolve(data.toString());
            });
        });
    }

    private findFileAndExtractCoverage(lcovFile: string, file: string): Promise<Array<Detail>> {
        return new Promise<Array<Detail>>((resolve, reject) => {
            parse(lcovFile, (err, data) => {
                if(err) return reject(err);
                let section = data.find(section => section.file === file);

                if(!section) return reject(new Error("No coverage for file!"));
                return resolve(section.lines.details);
            });
        });
    }
}