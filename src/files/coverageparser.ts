import { parseContent as parseContentClover } from "@cvrg-report/clover-json";
import { parseContent as parseContentCobertura } from "cobertura-parse";
import { parseContent as parseContentJacoco } from "@7sean68/jacoco-parse";
import { Section, source } from "lcov-parse";
import { OutputChannel } from "vscode";

import { CoverageFile, CoverageType } from "./coveragefile";

export class CoverageParser {
    private outputChannel: OutputChannel;

    constructor(outputChannel: OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Extracts coverage sections of type xml and lcov
     * @param files array of coverage files in string format
     */
    public async filesToSections(
        files: Map<string, string>
    ): Promise<Map<string, Section>> {
        const coverages = new Map<string, Section>();
        const parsePromises: Promise<Section[]>[] = [];

        for (const [fileName, fileContent] of files) {
            // get coverage file type
            const coverageFile = new CoverageFile(fileContent);
            switch (coverageFile.type) {
                case CoverageType.CLOVER:
                    parsePromises.push(this.xmlExtractClover(
                        fileName,
                        fileContent
                    ));
                    break;
                case CoverageType.JACOCO:
                    parsePromises.push(this.xmlExtractJacoco(
                        fileName,
                        fileContent
                    ));
                    break;
                case CoverageType.COBERTURA:
                    parsePromises.push(this.xmlExtractCobertura(
                        fileName,
                        fileContent
                    ));
                    break;
                case CoverageType.LCOV:
                    parsePromises.push(this.lcovExtract(fileName, fileContent));
                    break;
                default:
                    break;
            }
        }

        const results = await Promise.all(parsePromises);
        const flattenedSections = results.reduce((acc, val) => acc.concat(val), []);
        await this.addSections(coverages, flattenedSections);

        return coverages;
    }

    private async addSections(
        coverages: Map<string, Section>,
        data: Section[]
    ): Promise<void[]> {
        const addToSectionsMap = async (section: Section) => {
            const key = [section.title, section.file].join("::");
            const existingSection = coverages.get(key);

            if (!existingSection) {
                coverages.set(key, section);
                return;
            }

            const mergedSection = this.mergeSections(existingSection, section);
            coverages.set(key, mergedSection);
        };

        // convert the array of sections into an unique map
        const addPromises = data.map(addToSectionsMap);
        return await Promise.all(addPromises);
    }

    private xmlExtractCobertura(
        coverageFilename: string,
        xmlFile: string
    ) {
        return new Promise<Section[]>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("cobertura-parse", err);
                    return resolve([]);
                }
            };

            try {
                parseContentCobertura(
                    xmlFile,
                    async (err, data) => {
                        checkError(err);
                        return resolve(data);
                    },
                    true
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private xmlExtractJacoco(
        coverageFilename: string,
        xmlFile: string
    ) {
        return new Promise<Section[]>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("jacoco-parse", err);
                    return resolve([]);
                }
            };

            try {
                parseContentJacoco(xmlFile, async (err, data) => {
                    checkError(err);
                    return resolve(data);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private async xmlExtractClover(
        coverageFilename: string,
        xmlFile: string
    ): Promise<Section[]> {
        try {
            const data = await parseContentClover(xmlFile);
            return data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            error.message = `filename: ${coverageFilename} ${error.message}`;
            this.handleError("clover-parse", error);
            return [];
        }
    }

    private lcovExtract(
        coverageFilename: string,
        lcovFile: string
    ) {
        return new Promise<Section[]>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("lcov-parse", err);
                    return resolve([]);
                }
            };

            try {
                source(lcovFile, async (err, data) => {
                    checkError(err);
                    return resolve(data);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private mergeSections(existingSection: Section, section: Section): Section {
        const lines = this.mergeLineCoverage(existingSection, section);
        const branches = this.mergeBranchCoverage(existingSection, section);

        return {
            ...existingSection,
            lines,
            branches,
        };
    }

    private mergeLineCoverage(
        existingCoverage: Section,
        coverage: Section
    ): Section["lines"] {
        let hit = 0;
        let found = 0;
        const seen = new Set();
        const hits = new Set(
            coverage.lines.details
                .filter(({ hit }) => hit > 0)
                .map(({ line }) => line)
        );

        const details = existingCoverage.lines.details.map((line) => {
            found += 1;
            seen.add(line.line);

            if (hits.has(line.line)) {
                line.hit += 1;
            }

            if (line.hit > 0) {
                hit += 1;
            }

            return line;
        });

        coverage.lines.details
            .filter(({ line }) => !seen.has(line))
            .map((line) => {
                found += 1;

                if (line.hit > 0) {
                    hit += 1;
                }

                details.push(line);
            });

        return { details, hit, found };
    }

    private mergeBranchCoverage(
        existingCoverage: Section,
        coverage: Section
    ): Section["branches"] {
        if (!coverage.branches) {
            return existingCoverage.branches;
        }
        if (!existingCoverage.branches) {
            return coverage.branches;
        }

        let hit = 0;
        let found = 0;
        const seen = new Set();

        const getKey = (branch: {
            line: number;
            block: number;
            branch: number;
        }) => [branch.line, branch.block, branch.branch].join(":");

        const taken = new Set(
            coverage.branches.details
                .filter(({ taken }) => taken > 0)
                .map(getKey)
        );

        const details = existingCoverage.branches.details.map((branch) => {
            const key = getKey(branch);
            found += 1;
            seen.add(key);

            if (taken.has(key)) {
                branch.taken += 1;
            }

            if (branch.taken > 0) {
                hit += 1;
            }

            return branch;
        });

        coverage.branches.details
            .filter((branch) => !seen.has(getKey(branch)))
            .map((branch) => {
                found += 1;

                if (branch.taken > 0) {
                    hit += 1;
                }

                details.push(branch);
            });

        return { details, hit, found };
    }

    private handleError(system: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(
            `[${Date.now()}][coverageparser][${system}]: Error: ${message}`
        );
        if (stackTrace) {
            this.outputChannel.appendLine(
                `[${Date.now()}][coverageparser][${system}]: Stacktrace: ${stackTrace}`
            );
        }
    }
}
