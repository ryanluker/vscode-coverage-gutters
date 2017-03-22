"use strict";

import {configStore} from "./config";
import {LcovParseInterface} from "./wrappers/lcov-parse";
import {VscodeInterface} from "./wrappers/vscode";

import {Range, workspace} from "vscode";
import {Detail} from "lcov-parse";

export interface indicators {
    render(lines: Array<Detail>): Promise<string>;
    extract(lcovFile: string, file: string): Promise<Array<Detail>>;
}

export class Indicators implements indicators{
    private parse: LcovParseInterface;
    private vscode: VscodeInterface;
    private configStore: configStore;

    constructor(
        parse: LcovParseInterface,
        vscode: VscodeInterface,
        configStore: configStore
    ) {
        this.parse = parse;
        this.vscode = vscode;
        this.configStore = configStore;
    }

    public render(lines: Detail[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let renderLines = [];
            lines.forEach((detail) => {
                if(detail.hit > 0) {
                    renderLines.push(new Range(detail.line - 1, 0, detail.line - 1, 0));
                }
            });
            this.vscode.setDecorations(this.configStore.coverageDecorationType, renderLines);
            this.vscode.setDecorations(this.configStore.gutterDecorationType, renderLines);
            return resolve();
        });
    }

    public extract(lcovFile: string, file: string): Promise<Array<Detail>> {
        return new Promise<Array<Detail>>((resolve, reject) => {
            this.parse.source(lcovFile, (err, data) => {
                if(err) return reject(err);
                let section = data.find((section) => {
                    return this.compareFilePaths(section.file, file);
                });

                if(!section) return reject(new Error("No coverage for file!"));
                return resolve(section.lines.details);
            });
        });
    }

    private compareFilePaths(lcovFile: string, file: string): boolean {
        if(this.configStore.altSfCompare) {
            //consider windows and linux file paths
            const sourceFile = lcovFile.split(/[\\\/]/).reverse();
            const openFile = file.split(/[\\\/]/).reverse();
            const folderName = workspace.rootPath.split(/[\\\/]/).reverse()[0];
            let match = true;
            let index = 0;

            //work backwards from the file folder leaf to folder node
            do {
                if(sourceFile[index] === openFile[index]) {
                    index++;
                } else {
                    match = false;
                    break;
                }
            } while(folderName !== openFile[index]);

            return match;
        } else {
            //prevent hazardous casing mishaps
            return lcovFile.toLocaleLowerCase() === file.toLocaleLowerCase();
        }
    }
}