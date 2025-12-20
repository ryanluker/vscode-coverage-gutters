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

        for (const [fileName, fileContent] of files) {
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
                case CoverageType.LLVM_COV_JSON:
                    await this.jsonExtractLlvmCov(
                        coverages,
                        fileName,
                        fileContent
                    );
                    break;
                case CoverageType.LCOV:
                    await this.lcovExtract(coverages, fileName, fileContent);
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

    private async jsonExtractLlvmCov(
        coverages: Map<string, Section>,
        coverageFilename: string,
        jsonFile: string
    ) {
        return new Promise<void>((resolve) => {
            try {
                const jsonData = JSON.parse(jsonFile);
                const sections = this.transformLlvmCovToSections(jsonData);
                
                if (sections.length === 0) {
                    this.outputChannel.appendLine(
                        `[${Date.now()}][coverageparser][llvm-cov]: No coverage data found in ${coverageFilename}`
                    );
                } else {
                    this.outputChannel.appendLine(
                        `[${Date.now()}][coverageparser][llvm-cov]: Parsed ${sections.length} section(s) from ${coverageFilename}`
                    );
                }

                this.addSections(coverages, sections).then(() => resolve()).catch((error) => {
                    const err = error as Error;
                    err.message = `filename: ${coverageFilename} ${err.message}`;
                    this.handleError("llvm-cov-parse", err);
                    resolve();
                });
            } catch (error: unknown) {
                const err = error as Error;
                err.message = `filename: ${coverageFilename} ${err.message}`;
                this.handleError("llvm-cov-parse", err);
                return resolve();
            }
        });
    }

    /**
     * Transforms LLVM-cov JSON format to normalized Section format
     * LLVM-cov JSON structure:
     * {
     *   "data": [
     *     {
     *       "files": [
     *         {
     *           "filename": "path/to/file.cpp",
     *           "segments": [[line, col, count, hasCount, isRegionEntry, isGapRegion], ...],
     *           "branches": [[startLine, startCol, endLine, endCol, count, falseCount, blockId, branchId, type], ...]
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    private transformLlvmCovToSections(jsonData: unknown): Section[] {
        const sections: Section[] = [];

        type LlvmCovSegment = [number, number, number, boolean, boolean?, boolean?];
        type LlvmCovBranch = [number, number, number, number, number, number, number, number, unknown?];
        type LlvmCovFile = {
            filename: string;
            segments?: unknown;
            branches?: unknown;
        };
        type LlvmCovDataEntry = { files?: unknown };
        type LlvmCovJson = { data?: unknown };

        const parsed = jsonData as LlvmCovJson;
        if (!Array.isArray(parsed?.data)) {
            return sections;
        }

        for (const entry of parsed.data as LlvmCovDataEntry[]) {
            if (!Array.isArray(entry?.files)) {
                continue;
            }

            for (const file of entry.files as LlvmCovFile[]) {
                if (!file || typeof file.filename !== "string") {
                    continue;
                }
                const section: Section = {
                    title: "llvm-cov",
                    file: file.filename,
                    lines: {
                        details: [],
                        found: 0,
                        hit: 0,
                    },
                    functions: {
                        details: [],
                        found: 0,
                        hit: 0,
                    },
                    branches: {
                        details: [],
                        found: 0,
                        hit: 0,
                    },
                };

                // Process segments to extract line coverage
                 // Segment format: [line, col, count, hasCount, isRegionEntry, isGapRegion]
                const lineHits = new Map<number, number>();
                // Keep raw LLVM segment entries by line for region-wise hover details
                const llvmSegmentsByLine: Record<number, Array<{ col: number; count: number; hasCount: boolean; isRegionEntry: boolean; isGapRegion: boolean }>> = {};
                if (Array.isArray(file.segments)) {
                    for (const segment of file.segments as LlvmCovSegment[]) {
                        if (!Array.isArray(segment) || segment.length < 4) {
                            continue;
                        }
                        const [line, col, count, hasCount, isRegionEntry, isGapRegion] = segment;
                        if (typeof line !== "number" || line <= 0 || !hasCount) {
                            continue;
                        }
                        const existingHit = lineHits.get(line) || 0;
                        lineHits.set(line, Math.max(existingHit, count > 0 ? 1 : 0));
                        if (!llvmSegmentsByLine[line]) {
                            llvmSegmentsByLine[line] = [];
                        }
                        llvmSegmentsByLine[line].push({
                            col: Number(col) || 0,
                            count: Number(count) || 0,
                            hasCount: !!hasCount,
                            isRegionEntry: !!isRegionEntry,
                            isGapRegion: !!isGapRegion,
                        });
                    }
                }

                // Convert line hits to coverage details
                const lineDetails: Array<{line: number, hit: number}> = [];
                for (const [line, hit] of lineHits.entries()) {
                    lineDetails.push({ line, hit });
                    section.lines.found += 1;
                    if (hit > 0) {
                        section.lines.hit += 1;
                    }
                }
                section.lines.details = lineDetails;

                // Process branches
                 // Branch format: [startLine, startCol, endLine, endCol, count, falseCount, blockId, branchId, type]
                if (Array.isArray(file.branches)) {
                    for (const branch of file.branches as LlvmCovBranch[]) {
                        if (!Array.isArray(branch) || branch.length < 8) {
                            continue;
                        }
                        const [startLine, , , , count, falseCount, blockId, branchId] = branch;
                        if (typeof startLine !== "number" || typeof blockId !== "number" || typeof branchId !== "number") {
                            continue;
                        }
                        const trueDetail = {
                            line: startLine,
                            block: blockId,
                            branch: branchId * 2, // edge 0 (true)
                            taken: Number(count) > 0 ? 1 : 0,
                        };
                        const falseDetail = {
                            line: startLine,
                            block: blockId,
                            branch: branchId * 2 + 1, // edge 1 (false)
                            taken: Number(falseCount) > 0 ? 1 : 0,
                        };

                        section.branches!.details.push(trueDetail);
                        section.branches!.details.push(falseDetail);
                        section.branches!.found += 2;
                        if (trueDetail.taken > 0) { section.branches!.hit += 1; }
                        if (falseDetail.taken > 0) { section.branches!.hit += 1; }
                    }
                }

                // Attach raw LLVM segment data for hover providers (non-standard extension)
                type SectionWithSegments = Section & {
                    __llvmSegmentsByLine?: Record<number, Array<{ col: number; count: number; hasCount: boolean; isRegionEntry: boolean; isGapRegion: boolean }>>;
                };
                const sectionWithSegments: SectionWithSegments = section;
                sectionWithSegments.__llvmSegmentsByLine = llvmSegmentsByLine;

                sections.push(sectionWithSegments);
            }
        }

        return sections;
    }

}
