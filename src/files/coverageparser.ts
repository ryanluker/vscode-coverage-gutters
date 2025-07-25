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
                    coverage = await this.xmlExtractClover(
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.JACOCO:
                    coverage = await this.xmlExtractJacoco(
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.COBERTURA:
                    coverage = await this.xmlExtractCobertura(
                        fileName,
                        fileContent
                    );
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

        if (files.size <= 1) {
            return coverages;
        }

        return this.mergeCoverageSections(coverages);
    }

    private async convertSectionsToMap(
        coverageFilename: string,
        data: Section[]
    ): Promise<Map<string, Section>> {
        const sections = new Map<string, Section>();
        const addToSectionsMap = async (section: Section) => {
            sections.set(
                [coverageFilename, section.title, section.file].join("::"),
                section
            );
        };

        // convert the array of sections into an unique map
        const addPromises = data.map(addToSectionsMap);
        await Promise.all(addPromises);
        return sections;
    }

    private xmlExtractCobertura(coverageFilename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("cobertura-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentCobertura(
                    xmlFile,
                    async (err, data) => {
                        checkError(err);
                        const sections = await this.convertSectionsToMap(
                            coverageFilename,
                            data
                        );
                        return resolve(sections);
                    },
                    true
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private xmlExtractJacoco(coverageFilename: string, xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("jacoco-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                parseContentJacoco(xmlFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(
                        coverageFilename,
                        data
                    );
                    return resolve(sections);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private async xmlExtractClover(coverageFilename: string, xmlFile: string) {
        try {
            const data = await parseContentClover(xmlFile);
            const sections = await this.convertSectionsToMap(
                coverageFilename,
                data
            );
            return sections;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            error.message = `filename: ${coverageFilename} ${error.message}`;
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
    }

    private lcovExtract(coverageFilename: string, lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve) => {
            const checkError = (err: Error) => {
                if (err) {
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("lcov-parse", err);
                    return resolve(new Map<string, Section>());
                }
            };

            try {
                source(lcovFile, async (err, data) => {
                    checkError(err);
                    const sections = await this.convertSectionsToMap(
                        coverageFilename,
                        data
                    );
                    return resolve(sections);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                checkError(error);
            }
        });
    }

    private mergeCoverageSections(
        coverages: Map<string, Section>
    ): Map<string, Section> {
        const mergedCoverages = new Map<string, Section>();
        for (const coverage of coverages.values()) {
            const existingCoverage = mergedCoverages.get(coverage.file);

            if (!existingCoverage) {
                mergedCoverages.set(coverage.file, coverage);
                continue;
            }

            const lines = this.mergeLineCoverage(existingCoverage, coverage);
            const branches = this.mergeBranchCoverage(
                existingCoverage,
                coverage
            );

            mergedCoverages.set(coverage.file, {
                ...existingCoverage,
                lines,
                branches,
            });
        }

        return mergedCoverages;
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
                .filter(({ hit }) => hit)
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
        }) => `${branch.line}-${branch.block}-${branch.branch}`;

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
