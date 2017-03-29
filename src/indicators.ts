import {ConfigStore} from "./config";
import {InterfaceLcovParse} from "./wrappers/lcov-parse";
import {InterfaceVscode} from "./wrappers/vscode";

import {LcovSection} from "lcov-parse";
import {Range, TextEditor} from "vscode";

export interface InterfaceIndicators {
    renderToTextEditor(lines: LcovSection, textEditor: TextEditor): Promise<string>;
    extract(lcovFile: string, file: string): Promise<LcovSection>;
}

type CoverageLines = {
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

            textEditor.setDecorations(this.configStore.fullCoverageDecorationType, coverageLines.full);
            textEditor.setDecorations(this.configStore.noCoverageDecorationType, coverageLines.none);
            textEditor.setDecorations(this.configStore.partialCoverageDecorationType, coverageLines.partial);
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

    private filterCoverage(section: LcovSection, coverageLines: CoverageLines): CoverageLines {
        section.branches.details.forEach((detail) => {
            if (detail.branch === 0 && detail.taken === 0) {
                coverageLines.partial.push(new Range(detail.line - 1, 0, detail.line - 1, 0));
            } // if taken is > 0 then line is considered covered
        });
        section.lines.details.forEach((detail) => {
            if (detail.hit > 0) {
                const fullRange = new Range(detail.line - 1, 0, detail.line - 1, 0);

                // if there is already a partial for this line, do not add another
                if (!coverageLines.partial.find((range) => range.isEqual(fullRange))) {
                    coverageLines.full.push(fullRange);
                }
            } else {
                coverageLines.none.push(new Range(detail.line - 1, 0, detail.line - 1, 0));
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
