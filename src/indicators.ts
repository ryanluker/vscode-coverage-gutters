import {ConfigStore} from "./config";
import {InterfaceLcovParse} from "./wrappers/lcov-parse";
import {InterfaceVscode} from "./wrappers/vscode";

import {Detail} from "lcov-parse";
import {Range, TextEditor} from "vscode";

export interface InterfaceIndicators {
    renderToTextEditor(lines: Detail[], textEditor: TextEditor): Promise<string>;
    extract(lcovFile: string, file: string): Promise<Detail[]>;
}

export class Indicators implements InterfaceIndicators {
    private parse: InterfaceLcovParse;
    private vscode: InterfaceVscode;
    private configStore: ConfigStore;

    constructor(
        parse: InterfaceLcovParse,
        vscode: InterfaceVscode,
        configStore: ConfigStore,
    ) {
        this.parse = parse;
        this.vscode = vscode;
        this.configStore = configStore;
    }

    public renderToTextEditor(lines: Detail[], textEditor: TextEditor): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let renderLines = [];
            lines.forEach((detail) => {
                if (detail.hit > 0) {
                    renderLines.push(new Range(detail.line - 1, 0, detail.line - 1, 0));
                }
            });
            textEditor.setDecorations(this.configStore.fullCoverageDecorationType, renderLines);
            return resolve();
        });
    }

    public extract(lcovFile: string, file: string): Promise<Detail[]> {
        return new Promise<Detail[]>((resolve, reject) => {
            this.parse.source(lcovFile, (err, data) => {
                if (err) { return reject(err); }
                let section = data.find((lcovSection) => {
                    return this.compareFilePaths(lcovSection.file, file);
                });

                if (!section) { return reject(new Error("No coverage for file!")); }
                return resolve(section.lines.details);
            });
        });
    }

    private compareFilePaths(lcovFile: string, file: string): boolean {
        if (this.configStore.altSfCompare) {
            // consider windows and linux file paths
            const sourceFile = lcovFile.split(/[\\\/]/).reverse();
            const openFile = file.split(/[\\\/]/).reverse();
            const folderName = this.vscode.getRootPath().split(/[\\\/]/).reverse()[0];
            let match = true;
            let index = 0;

            // work backwards from the file folder leaf to folder node
            do {
                if (sourceFile[index] === openFile[index]) {
                    index++;
                } else {
                    match = false;
                    break;
                }
            } while (folderName !== openFile[index]);

            return match;
        } else {
            // prevent hazardous casing mishaps
            return lcovFile.toLocaleLowerCase() === file.toLocaleLowerCase();
        }
    }
}
