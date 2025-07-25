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

        for (const file of files) {
            const fileName = file[0];
            const fileContent = file[1];

            // get coverage file type
            const coverageFile = new CoverageFile(fileContent);
            switch (coverageFile.type) {
                case CoverageType.CLOVER:
                    await this.xmlExtractClover(
                        coverages,
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.JACOCO:
                    await this.xmlExtractJacoco(
                        coverages,
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.COBERTURA:
                    await this.xmlExtractCobertura(
                        coverages,
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.LCOV:
                    this.lcovExtract(coverages, fileName, fileContent);
                    break;
                default:
                    break;
            }
        }
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
        coverages: Map<string, Section>,
        coverageFilename: string,
        xmlFile: string
    ) {
        return new Promise<void>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("cobertura-parse", err);
                    return resolve();
                }
            };

            try {
                parseContentCobertura(
                    xmlFile,
                    async (err, data) => {
                        checkError(err);
                        await this.addSections(coverages, data);
                        return resolve();
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
        coverages: Map<string, Section>,
        coverageFilename: string,
        xmlFile: string
    ) {
        return new Promise<void>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("jacoco-parse", err);
                    return resolve();
                }
            };

            try {
                parseContentJacoco(xmlFile, async (err, data) => {
                    checkError(err);
                    await this.addSections(coverages, data);
                    return resolve();
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private async xmlExtractClover(
        coverages: Map<string, Section>,
        coverageFilename: string,
        xmlFile: string
    ) {
        try {
            const data = await parseContentClover(xmlFile);
            await this.addSections(coverages, data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            error.message = `filename: ${coverageFilename} ${error.message}`;
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
    }

    private lcovExtract(
        coverages: Map<string, Section>,
        coverageFilename: string,
        lcovFile: string
    ) {
        return new Promise<void>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("lcov-parse", err);
                    return resolve();
                }
            };

            try {
                source(lcovFile, async (err, data) => {
                    checkError(err);
                    await this.addSections(coverages, data);
                    return resolve();
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
