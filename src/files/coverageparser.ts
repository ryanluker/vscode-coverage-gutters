import {parseContent as parseContentClover} from "@cvrg-report/clover-json";
import {parseContent as parseContentCobertura} from "cobertura-parse";
import * as glob from "glob";
import {parseContent as parseContentJacoco} from "jacoco-parse";
import {Section, source} from "lcov-parse";
import {OutputChannel, workspace} from "vscode";

import {Config} from "../extension/config";
import {Reporter} from "../extension/reporter";
import {CoverageFile, CoverageType} from "./coveragefile";

export class CoverageParser {
    private configStore: Config;
    private outputChannel: OutputChannel;
    private eventReporter: Reporter;

    constructor(
        configStore: Config,
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
            const fileName = file[0];
            const fileContent = file[1];

            // file is an array
            let coverage = new Map<string, Section>();

            // get coverage file type
            const coverageFile = new CoverageFile(fileContent);
            const fileType = coverageFile.type;

            switch (fileType) {
                case CoverageType.CLOVER:
                    coverage = await this.xmlExtractClover(fileName, fileContent);
                    break;
                case CoverageType.JACOCO:
                    coverage = await this.xmlExtractJacoco(fileName, fileContent);
                    break;
                case CoverageType.COBERTURA:
                    coverage = await this.xmlExtractCobertura(fileName, fileContent);
                    break;
                case CoverageType.LCOV:
                    coverage = await this.lcovExtract(fileName, fileContent);
                    break;
                default:
                    break;
            }

            // add new coverage map to existing coverages generated so far
            coverages = new Map([...coverages, ...coverage]);
        }

        return coverages;
    }

    private async convertSectionsToMap(
        data: Section[],
        fileType: CoverageType,
    ): Promise<Map<string, Section>> {
        const sections = new Map<string, Section>();
        const addToSectionsMap = async (section) => {
            sections.set(section.file, section);
        };

        // convert the array of sections into an unique map
        const addPromises = data.map(addToSectionsMap);
        await Promise.all(addPromises);
        return sections;
    }

    private xmlExtractCobertura(filename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            const checkError = (err) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("cobertura-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentCobertura(xmlFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(
                        data,
                        CoverageType.COBERTURA,
                    );
                    this.eventReporter.sendEvent("system", "xmlExtractCobrtura-success");
                    return resolve(sections);
                });
            } catch (error) {
                checkError(error);
            }
        });
    }

    private xmlExtractJacoco(filename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            const checkError = (err) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("jacoco-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentJacoco(xmlFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(
                        data,
                        CoverageType.JACOCO,
                    );
                    this.eventReporter.sendEvent("system", "xmlExtractJacoco-success");
                    return resolve(sections);
                });
            } catch (error) {
                checkError(error);
            }
        });
    }

    private async xmlExtractClover(filename: string, xmlFile: string) {
        try {
            const data = await parseContentClover(xmlFile);
            const sections = await this.convertSectionsToMap(
                data,
                CoverageType.CLOVER,
            );
            this.eventReporter.sendEvent("system", "xmlExtractClover-success");
            return sections;
        } catch (error) {
            error.message = `filename: ${filename} ${error.message}`;
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
    }

    private lcovExtract(filename: string, lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            const checkError = (err) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("lcov-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                source(lcovFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(
                        data,
                        CoverageType.LCOV,
                    );
                    this.eventReporter.sendEvent("system", "lcovExtract-success");
                    return resolve(sections);
                });
            } catch (error) {
                checkError(error);
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
