import { Section } from "lcov-parse";
import {
    Range,
    TextEditor,
} from "vscode";
import { Config } from "../extension/config";
import { SectionFinder } from "./sectionfinder";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

interface CoverageSets {
    full: Set<number>;
    partial: Set<number>;
    none: Set<number>;
}

export class Renderer {
    private configStore: Config;
    private sectionFinder: SectionFinder;

    constructor(
        configStore: Config,
        sectionFinder: SectionFinder,
    ) {
        this.configStore = configStore;
        this.sectionFinder = sectionFinder;
    }

    /**
     * Renders coverage to editors
     * @param sections cached set of sections
     * @param textEditors currently visible text editors
     */
    public renderCoverage(
        sections: Map<string, Section>,
        textEditors: readonly TextEditor[],
    ) {
        // Single-pass iteration for better performance
        textEditors.forEach((textEditor) => {
            // Remove all decorations first to prevent graphical issues
            this.removeDecorationsForEditor(textEditor);

            // Reset lines for new editor
            const coverageSets: CoverageSets = {
                full: new Set<number>(),
                none: new Set<number>(),
                partial: new Set<number>(),
            };

            // find the section(s) (or undefined) by looking relatively at each workspace
            // users can also optional use absolute instead of relative for this
            const foundSections = this.sectionFinder.findSectionsForEditor(textEditor, sections);
            if (!foundSections.length) { return; }

            this.filterCoverage(foundSections, coverageSets);

            const coverageLines: ICoverageLines = {
                full: this.setsToRanges(coverageSets.full),
                none: this.setsToRanges(coverageSets.none),
                partial: this.setsToRanges(coverageSets.partial),
            };

            this.setDecorationsForEditor(textEditor, coverageLines);
        });
    }

    public removeDecorationsForEditor(editor: TextEditor) {
        editor.setDecorations(
            this.configStore.fullCoverageDecorationType,
            [],
        );
        editor.setDecorations(
            this.configStore.noCoverageDecorationType,
            [],
        );
        editor.setDecorations(
            this.configStore.partialCoverageDecorationType,
            [],
        );
    }

    public setDecorationsForEditor(
        editor: TextEditor,
        coverage: ICoverageLines,
    ) {
        // set new coverage on editor
        editor.setDecorations(
            this.configStore.fullCoverageDecorationType,
            coverage.full,
        );
        editor.setDecorations(
            this.configStore.noCoverageDecorationType,
            coverage.none,
        );
        editor.setDecorations(
            this.configStore.partialCoverageDecorationType,
            coverage.partial,
        );
    }

    /**
     * Takes an array of sections and computes the coverage lines
     * @param sections sections to filter the coverage for
     * @param coverageSets the current coverage sets as this point in time
     */
    private filterCoverage(
        sections: Section[],
        coverageSets: CoverageSets,
    ) {
        sections.forEach((section) => {
            this.filterLineCoverage(section, coverageSets);
            this.filterBranchCoverage(section, coverageSets);
        });
    }

    private filterLineCoverage(
        section: Section,
        coverageSets: CoverageSets,
    ) {
        if (!section || !section.lines) {
            return;
        }
        section.lines.details
            .filter((detail) => detail.line > 0)
            .forEach((detail) => {
                const line = detail.line - 1;
                if (detail.hit > 0) {
                    if (coverageSets.none.has(line)) {
                        coverageSets.none.delete(line);
                    }
                    coverageSets.full.add(line);
                } else {
                    if (!coverageSets.full.has(line)) {
                        // only add a none coverage if no full ones exist
                        coverageSets.none.add(line);
                    }
                }
            });
    }

    private filterBranchCoverage(
        section: Section,
        coverageSets: CoverageSets,
    ) {
        if (!section || !section.branches) {
            return;
        }
        section.branches.details
            .filter((detail) => detail.taken === 0 && detail.line > 0)
            .forEach((detail) => {
                const line = detail.line - 1;
                if (coverageSets.full.has(line)) {
                    coverageSets.full.delete(line);
                    coverageSets.partial.add(line);
                }
            });
    }

    private setsToRanges(lines: Set<number>): Range[] {
        const ranges: Range[] = [];
        lines.forEach((line) => {
            ranges.push(new Range(line, 0, line, 0));
        });
        return ranges;
    }
}
