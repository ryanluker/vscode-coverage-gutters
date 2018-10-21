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

    /**
     * Takes paths and tries to make them absolute
     * based on currently open workspaceFolders
     * @param path potential partial path to be converted
     */
    private convertPartialPathsToAbsolute(path: string): string {
        if (!workspace.workspaceFolders) { return path; }
        // Path is already absolute
        // Note 1: some coverage generators can start with no slash #160
        // Note 2: accounts for windows and linux style file paths
        // windows as they start with drives (ie: c:\)
        // linux as they start with forward slashes
        // both windows and linux use ./ or .\ for relative
        if (!path.startsWith(".") && path.startsWith("/")) { return path; }

        const folders = workspace.workspaceFolders.map(
            (folder) => folder.uri.fsPath,
        );
        const files: string[] = [];
        // look over all workspaces for the path
        folders.forEach((folder) => {
            // find the path in the workspace folder
            files.push(...glob.sync(
                `**/${path}`,
                {
                    cwd: folder,
                    dot: true,
                    ignore: this.configStore.ignoredPathGlobs,
                    realpath: true,
                },
            ));
        });
        if (files.length === 0) {
            // Some paths are already absolute but caught by this function
            // ie: C:\ for windows
            return path;
        }
        if (files.length > 1) {
            throw Error(`Found too many files with partial path ${path}`);
        }
        return files[0];
    }

    private convertSectionsToMap(
        data: Section[],
        fileType: CoverageType,
    ): Map<string, Section> {
        // convert the array of sections into an unique map
        const sections = new Map<string, Section>();
        data.forEach((section) => {
            let mapKey = section.file;
            try {
                // Check for the secion having a partial path
                mapKey = this.convertPartialPathsToAbsolute(section.file);
            } catch (error) {
                // remove stacktrace as it clutters the output and isnt useful
                error.stack = undefined;
                this.handleError(`${fileType}-convertPartialPathsToAbsolute`, error);
            }

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
            `[${Date.now()}][coverageparser][${system}]: Error: ${message}`,
        );
        if (stackTrace) {
            this.outputChannel.appendLine(
                `[${Date.now()}][coverageparser][${system}]: Stacktrace: ${stackTrace}`,
            );
        }
        this.eventReporter.sendEvent("system", `${system}-error`, `${stackTrace}`);
    }
}
