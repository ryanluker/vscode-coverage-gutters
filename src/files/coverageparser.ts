import {parseContent as parseContentClover} from "@cvrg-report/clover-json";
import {parseContent as parseContentCobertura} from "cobertura-parse";
import * as glob from "glob";
import {parseContent as parseContentJacoco} from "jacoco-parse";
import {Section, source} from "lcov-parse";
import {OutputChannel, workspace} from "vscode";
import {IConfigStore} from "../extension/config";
import {Reporter} from "../extension/reporter";

// tslint:disable:no-shadowed-variable

enum CoverageType {
    LCOV,
    CLOVER,
    COBERTURA,
    JACOCO,
}

export class CoverageParser {
    private configStore: IConfigStore;
    private outputChannel: OutputChannel;
    private eventReporter: Reporter;

    constructor(
        configStore: IConfigStore,
        outputChannel: OutputChannel,
        eventReporter: Reporter,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
    }

    /**
     * Extracts coverage sections of type xml and lcov
     * @param files array of coverage files in string format
     */
    public async filesToSections(files: Map<string, string>): Promise<Map<string, Section>> {
        let coverages = new Map<string, Section>();

        for (const file of files) {
            const value = file[1];
            const key = file[0];

            // file is an array
            let coverage = new Map<string, Section>();

            // get coverage file type
            const fileType = this.findCoverageFileType(value);
            switch (fileType) {
                case CoverageType.CLOVER:
                    coverage = await this.xmlExtractClover(value);
                    break;
                case CoverageType.JACOCO:
                    coverage = await this.xmlExtractJacoco(value);
                    break;
                case CoverageType.COBERTURA:
                    coverage = await this.xmlExtractCobertura(value);
                    break;
                case CoverageType.LCOV:
                    coverage = await this.lcovExtract(value);
                    break;
                default:
                    break;
            }

            // add new coverage map to existing coverages generated so far
            coverages = new Map([...coverages, ...coverage]);
        }

        return coverages;
    }

    private findCoverageFileType(file: string): CoverageType {
        let fileType = CoverageType.LCOV;
        if (
            file.includes("<?xml") &&
            file.includes("<coverage") &&
            file.includes("<project")
        ) {
            fileType = CoverageType.CLOVER;
        } else if (file.includes("JACOCO")) {
            fileType = CoverageType.JACOCO;
        } else if (file.includes("<?xml")) {
            fileType = CoverageType.COBERTURA;
        }
        return fileType;
    }

    private convertPartialPathsToAbsolute(
        path: string,
        fileType: CoverageType,
    ): string {
        let possiblePath = path;
        function findAbsolutePath() {
            if (!workspace.workspaceFolders) { return possiblePath; }
            const folders = workspace.workspaceFolders.map(
                (folder) => folder.uri.fsPath,
            );
            const files: string[] = [];
            // look over all workspaces for the possible path
            folders.forEach((folder) => {
                // find the possible path in the workspace folder
                files.push(...glob.sync(
                    `**/${possiblePath}`,
                    {
                        cwd: folder,
                        dot: true,
                        ignore: ["**/node_modules/**", "**/venv/**", "**/vendor/**"],
                        realpath: true,
                    },
                ));
            });
            if (files.length === 0) {
                throw Error(`Cannot find absolute path for ${possiblePath}`);
            }
            if (files.length > 1) {
                throw Error(`Found too many files with partial path ${possiblePath}`);
            }
            return files[0];
        }

        function findAbsolutePathFromTextDocumentsWhenRelativePath() {
            
            if (!workspace.textDocuments) { return possiblePath; }
            if (!possiblePath.startsWith('.')) { return possiblePath }
            
            const partialPath = possiblePath.substring(1);
        
            // look through currently open documents for possible path
            const filePaths = workspace.textDocuments.map(
                (document) => document.uri.fsPath,
            );
            const files: string[] = [];
            // find possible match to absolutely path of open document
            filePaths.forEach((filePath) => {
                if (filePath.endsWith(partialPath)) {
                    files.push(filePath)
                }
            })
            if (files.length === 1) {
                return files[0]
            } else {
                return possiblePath
            }
        }

        switch (fileType) {
            case CoverageType.COBERTURA:
            case CoverageType.JACOCO:
                try {
                    possiblePath = findAbsolutePath();
                } catch (error) {
                    // remove stacktrace as it clutters the output and isnt useful
                    error.stack = undefined;
                    this.handleError("convertPartialPathsToAbsolute", error);
                }
                break;
            default:
                possiblePath = findAbsolutePathFromTextDocumentsWhenRelativePath();
                break;
        }
        return possiblePath;
    }

    private convertSectionsToMap(
        data: Section[],
        fileType: CoverageType,
    ): Map<string, Section> {
        // convert the array of sections into an unique map
        const sections = new Map<string, Section>();
        data.forEach((section) => {
            // properly convert paths
            const mapKey = this.convertPartialPathsToAbsolute(section.file, fileType);
            // Assign mapKey to the section file as well to allow for renderer matching
            section.file = mapKey;
            sections.set(mapKey, section);
        });
        return sections;
    }

    private xmlExtractCobertura(xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                parseContentCobertura(xmlFile, (err, data) => {
                    if (err) { return reject(err); }
                    const sections = this.convertSectionsToMap(
                        data,
                        CoverageType.COBERTURA,
                    );
                    this.eventReporter.sendEvent("system", "xmlExtractCobrtura-success");
                    return resolve(sections);
                });
            } catch (error) {
                this.handleError("cobertura-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private xmlExtractJacoco(xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                parseContentJacoco(xmlFile, (err, data) => {
                    if (err) { return reject(err); }
                    const sections = this.convertSectionsToMap(
                        data,
                        CoverageType.JACOCO,
                    );
                    this.eventReporter.sendEvent("system", "xmlExtractJacoco-success");
                    return resolve(sections);
                });
            } catch (error) {
                this.handleError("jacoco-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private async xmlExtractClover(xmlFile: string) {
        try {
            const data = await parseContentClover(xmlFile);
            const sections = this.convertSectionsToMap(
                data,
                CoverageType.CLOVER,
            );
            this.eventReporter.sendEvent("system", "xmlExtractClover-success");
            return sections;
        } catch (error) {
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
    }

    private lcovExtract(lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                source(lcovFile, (err, data) => {
                    if (err) { return reject(err); }
                    const sections = this.convertSectionsToMap(
                        data,
                        CoverageType.LCOV,
                    );
                    this.eventReporter.sendEvent("system", "lcovExtract-success");
                    return resolve(sections);
                });
            } catch (error) {
                this.handleError("lcov-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private handleError(system: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(
            `[${Date.now()}][lcovparser][${system}]: Error: ${message}`,
        );
        if (stackTrace) {
            this.outputChannel.appendLine(
                `[${Date.now()}][lcovparser][${system}]: Stacktrace: ${stackTrace}`,
            );
        }
        this.eventReporter.sendEvent("system", `${system}-error`, `${stackTrace}`);
    }
}
