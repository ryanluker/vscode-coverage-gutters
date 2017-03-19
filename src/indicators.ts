"use strict";

import {configStore} from "./config";
import {Range} from "vscode";
import {Detail} from "lcov-parse";

export interface indicators {
    render(lines: Array<Detail>): Promise<string>,
    extract(lcovFile: string, file: string): Promise<Array<Detail>>
}

export class Indicators implements indicators{
    private parseLcov;
    private configStore: configStore;
    private setDecorations;

    constructor(configStore, parseLcov, setDecorations) {
        this.configStore = configStore;
        this.parseLcov = parseLcov;
        this.setDecorations = setDecorations;
    }

    public render(lines: Detail[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let renderLines = [];
            lines.forEach((detail) => {
                if(detail.hit > 0) {
                    renderLines.push(new Range(detail.line - 1, 0, detail.line - 1, 0));
                }
            });
            this.setDecorations(this.configStore.coverageDecorationType, renderLines);
            return resolve();
        });
    }

    public extract(lcovFile: string, file: string): Promise<Array<Detail>> {
        return new Promise<Array<Detail>>((resolve, reject) => {
            this.parseLcov(lcovFile, (err, data) => {
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