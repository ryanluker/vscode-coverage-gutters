import {parseContent as parseContentClover} from "@cvrg-report/clover-json";
import {parseContent as parseContentCobertura} from "cobertura-parse";
import {parseContent as parseContentJacoco} from "jacoco-parse";
import {Section, source} from "lcov-parse";
import {OutputChannel} from "vscode";

import {CoverageFile, CoverageType} from "./coveragefile";

export class CoverageParser {
    private outputChannel: OutputChannel;

    constructor(outputChannel: OutputChannel) {
        this.outputChannel = outputChannel;
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
            switch (coverageFile.type) {
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
    ): Promise<Map<string, Section>> {
        const sections = new Map<string, Section>();
        const addToSectionsMap = async (section: Section) => {
            sections.set(section.title + "::" + section.file, section);
        };

        // convert the array of sections into an unique map
        const addPromises = data.map(addToSectionsMap);
        await Promise.all(addPromises);
        return sections;
    }

    private xmlExtractCobertura(filename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("cobertura-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentCobertura(xmlFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(data);
                    return resolve(sections);
                }, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private xmlExtractJacoco(filename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("jacoco-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentJacoco(xmlFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(data);
                    return resolve(sections);
                });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private async xmlExtractClover(filename: string, xmlFile: string) {
        try {
            const data = await parseContentClover(xmlFile);
            const sections = await this.convertSectionsToMap(data);
            return sections;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            error.message = `filename: ${filename} ${error.message}`;
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
    }

    private lcovExtract(filename: string, lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${filename} ${err.message}`;
                    this.handleError("lcov-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                source(lcovFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(data);
                    return resolve(sections);
                });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
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
    }
}
