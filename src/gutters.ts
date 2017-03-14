'use strict';

import * as vscode from "vscode";
import * as parse from "lcov-parse";
import {readFile} from "fs";

export class Gutters {
    private lcovFileName: string;
    private coverageDecorationType: vscode.TextEditorDecorationType;
    private coverageLightBackgroundColour: string;
    private coverageDarkBackgroundColour: string;

    constructor() {
        const config = vscode.workspace.getConfiguration("coverage-gutters");

        //Customizable UI configurations
        const configsCustom = Object.keys(config.get("customizable"));
        for(let element of configsCustom) {
            vscode.commands.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                vscode.workspace.getConfiguration("coverage-gutters.customizable").get(element));
        }

        //Basic configurations
        this.lcovFileName = config.get("lcovname") as string;
        this.coverageLightBackgroundColour = config.get("highlightlight") as string;
        this.coverageDarkBackgroundColour = config.get("highlightdark") as string;

        this.coverageDecorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            light: {
                backgroundColor: this.coverageLightBackgroundColour
            },
            dark: {
                backgroundColor: this.coverageDarkBackgroundColour
            }
        });
    }

    public async displayCoverageForActiveFile() {
        try {
            const activeFile = vscode.window.activeTextEditor.document.fileName;
            const lcovPath = await this.findLcov();
            const lcovFile = await this.loadLcov(lcovPath);
            const coveredLines = await this.extractCoverage(lcovFile, activeFile);
            await this.renderIndicators(coveredLines);
        } catch(e) {
            console.log(e);
        }
    }

    public dispose() {
        vscode.window.activeTextEditor.setDecorations(this.coverageDecorationType, []);
    }

    private findLcov(): Promise<string> {
        return new Promise((resolve, reject) => {
            vscode.workspace.findFiles("**/" + this.lcovFileName, "**/node_modules/**", 1)
                .then((uriLcov) => {
                    if(!uriLcov.length) return reject(new Error("Could not find a lcov file!"));
                    return resolve(uriLcov[0].fsPath);
                });
        });
    }

    private renderIndicators(lines: Detail[]): Promise<Function> {
        return new Promise((resolve, reject) => {
            let renderLines = [];
            lines.forEach((detail) => {
                if(detail.hit > 0) {
                    renderLines.push(new vscode.Range(detail.line - 1, 0, detail.line - 1, 0));
                }
            });
            vscode.window.activeTextEditor.setDecorations(this.coverageDecorationType, renderLines);
            return resolve();
        });
    }

    private loadLcov(lcovPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(lcovPath, (err, data) => {
                if(err) return reject(err);
                return resolve(data.toString());
            });
        });
    }

    private extractCoverage(lcovFile: string, file: string): Promise<Array<Detail>> {
        return new Promise<Array<Detail>>((resolve, reject) => {
            parse(lcovFile, (err, data) => {
                if(err) return reject(err);
                let section = data.find((section) => {
                    //prevent hazardous casing mishaps
                    return section.file.toLocaleLowerCase() === file.toLocaleLowerCase();
                });

                if(!section) return reject(new Error("No coverage for file!"));
                return resolve(section.lines.details);
            });
        });
    }
}