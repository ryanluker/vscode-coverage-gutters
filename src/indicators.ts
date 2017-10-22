import {IConfigStore} from "./config";
import {InterfaceLcovParse} from "./wrappers/lcov-parse";
import {InterfaceVscode} from "./wrappers/vscode";
import {InterfaceXmlParse} from "./wrappers/xml-parse";

import {Section} from "lcov-parse";
import {extname} from "path";
import {Range, TextEditor} from "vscode";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

export class Indicators {
    private lcovParse: InterfaceLcovParse;
    private xmlParse: InterfaceXmlParse;
    private vscode: InterfaceVscode;
    private configStore: IConfigStore;

    constructor(
        xmlParse: InterfaceXmlParse,
        lcovParse: InterfaceLcovParse,
        vscode: InterfaceVscode,
        configStore: IConfigStore,
    ) {
        this.lcovParse = lcovParse;
        this.xmlParse = xmlParse;
        this.vscode = vscode;
        this.configStore = configStore;
    }

    public renderToTextEditor(section: Section, textEditor: TextEditor): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const coverageLines: ICoverageLines = {
                full: [],
                none: [],
                partial: [],
            };

            this.filterCoverage(section, coverageLines);
            this.setDecorationsForEditor(textEditor, coverageLines);

            return resolve();
        });
    }

    public async extractCoverage(coverageFile: string, file: string): Promise<Section> {
        if (coverageFile.includes("<?xml")) {
            return this.xmlExtract(coverageFile, file);
        } else {
            return this.lcovExtract(coverageFile, file);
        }
    }

    private xmlExtract(xmlFile: string, file: string): Promise<Section> {
        if (xmlFile === "") { return Promise.reject("No coverage details inside file!"); }
        return new Promise<Section>((resolve, reject) => {
            this.xmlParse.parseContent(xmlFile, (err, data) => {
                if (err) { return reject(err); }
                const section = data.find((lcovSection) => {
                    const rootFolder = this.vscode.getRootPath().split(/[\\\/]/).reverse()[0];
                    const coverageFile = `${rootFolder}/${lcovSection.file}`;
                    return this.compareFilePaths(coverageFile, file);
                });

                if (!section) { return reject(new Error("No coverage for file!")); }
                return resolve(section);
            });
        });
    }

    private lcovExtract(lcovFile: string, file: string): Promise<Section> {
        if (lcovFile === "") { return Promise.reject("No coverage details inside file!"); }
        return new Promise<Section>((resolve, reject) => {
            this.lcovParse.source(lcovFile, (err, data) => {
                if (err) { return reject(err); }
                const section = data.find((lcovSection) => {
                    return this.compareFilePaths(lcovSection.file, file);
                });

                if (!section) { return reject(new Error("No coverage for file!")); }
                return resolve(section);
            });
        });
    }

    private setDecorationsForEditor(editor: TextEditor, coverage: ICoverageLines) {
        // remove coverage first to prevent graphical conflicts
        editor.setDecorations(this.configStore.fullCoverageDecorationType, []);
        editor.setDecorations(this.configStore.noCoverageDecorationType, []);
        editor.setDecorations(this.configStore.partialCoverageDecorationType, []);

        editor.setDecorations(this.configStore.fullCoverageDecorationType, coverage.full);
        editor.setDecorations(this.configStore.noCoverageDecorationType, coverage.none);
        editor.setDecorations(this.configStore.partialCoverageDecorationType, coverage.partial);
    }

    private filterCoverage(section: Section, coverageLines: ICoverageLines): ICoverageLines {
        section.lines.details.forEach((detail) => {
            const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            if (detail.hit > 0) {
                coverageLines.full.push(lineRange);
            } else {
                coverageLines.none.push(lineRange);
            }
        });

        if (section.branches) {
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
        }
        return coverageLines;
    }

    private compareFilePaths(coverageFile: string, file: string): boolean {
        if (this.configStore.altSfCompare) {
            // consider windows and linux file paths
            const sourceFile = coverageFile.split(/[\\\/]/).reverse();
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
            return coverageFile.toLocaleLowerCase() === file.toLocaleLowerCase();
        }
    }
}
