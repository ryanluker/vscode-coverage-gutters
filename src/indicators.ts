import {ConfigStore} from "./config";
import {InterfaceLcovParse} from "./wrappers/lcov-parse";
import {InterfaceVscode} from "./wrappers/vscode";

import {LcovSection} from "lcov-parse";
import {Range, TextEditor} from "vscode";

export interface InterfaceIndicators {
    renderToTextEditor(lines: LcovSection, textEditor: TextEditor): Promise<string>;
    extract(lcovFile: string, file: string): Promise<LcovSection>;
}

export type CoverageLines = {
    full: Range[];
    partial: Range[];
    none: Range[];
};

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

    public renderToTextEditor(section: LcovSection, textEditor: TextEditor): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let coverageLines: CoverageLines = {
                full: [],
                none: [],
                partial: [],
            };

            this.filterCoverage(section, coverageLines);
            this.setDecorationsForEditor(textEditor, coverageLines);

            return resolve();
        });
    }

    public extract(lcovFile: string, file: string): Promise<LcovSection> {
        return new Promise<LcovSection>((resolve, reject) => {
            this.parse.source(lcovFile, (err, data) => {
                if (err) { return reject(err); }
                let section = data.find((lcovSection) => {
                    return this.compareFilePaths(lcovSection.file, file);
                });

                if (!section) { return reject(new Error("No coverage for file!")); }
                return resolve(section);
            });
        });
    }

    private setDecorationsForEditor(editor: TextEditor, coverage: CoverageLines) {
        // remove coverage first to prevent graphical conflicts
        editor.setDecorations(this.configStore.fullCoverageDecorationType, []);
        editor.setDecorations(this.configStore.noCoverageDecorationType, []);
        editor.setDecorations(this.configStore.partialCoverageDecorationType, []);

        editor.setDecorations(this.configStore.fullCoverageDecorationType, coverage.full);
        editor.setDecorations(this.configStore.noCoverageDecorationType, coverage.none);
        editor.setDecorations(this.configStore.partialCoverageDecorationType, coverage.partial);
    }

    private filterCoverage(section: LcovSection, coverageLines: CoverageLines): CoverageLines {
        section.lines.details.forEach((detail) => {
            const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            if (detail.hit > 0) {
                coverageLines.full.push(lineRange);
            } else {
                coverageLines.none.push(lineRange);
            }
        });

        section.branches.details.forEach((detail) => {
            if (detail.branch === 0 && detail.taken === 0) {
                const partialRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
                if (coverageLines.full.find((range) => range.isEqual(partialRange))) {
                    // remove full converage if partial is a better match
                    coverageLines.full = coverageLines.full.filter((range) => !range.isEqual(partialRange));
                    coverageLines.partial.push(partialRange);
                }
            }
        });
        return coverageLines;
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
