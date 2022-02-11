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
        const coverageLines: ICoverageLines = {
            full: [],
            none: [],
            partial: [],
        };

        textEditors.forEach((textEditor) => {
            // Remove all decorations first to prevent graphical issues
            this.removeDecorationsForEditor(textEditor);
        });

        textEditors.forEach((textEditor) => {
            // Reset lines for new editor
            coverageLines.full = [];
            coverageLines.none = [];
            coverageLines.partial = [];

            // find the section(s) (or undefined) by looking relatively at each workspace
            // users can also optional use absolute instead of relative for this
            const foundSections = this.sectionFinder.findSectionsForEditor(textEditor, sections);
            if (!foundSections.length) { return; }

            this.filterCoverage(foundSections, coverageLines);
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
     * @param coverageLines the current coverage lines as this point in time
     */
    private filterCoverage(
        sections: Section[],
        coverageLines: ICoverageLines,
    ) {
        sections.forEach((section) => {
            this.filterLineCoverage(section, coverageLines);
            this.filterBranchCoverage(section, coverageLines);
        });
    }

    private filterLineCoverage(
        section: Section,
        coverageLines: ICoverageLines,
    ) {
        if (!section || !section.lines) {
            return;
        }
        // TODO cleanup this area by using maps, filters, etc
        section.lines.details.forEach((detail) => {
            if (detail.line < 0) { return; }
            const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            if (detail.hit > 0) {
                if (coverageLines.none.find((range) => range.isEqual(lineRange))) {
                    // remove all none coverage, for this line, if one full exists
                    coverageLines.none = coverageLines.none.filter((range) => !range.isEqual(lineRange));
                }
                coverageLines.full.push(lineRange);
            } else {
                const fullExists = coverageLines.full.find((range) => range.isEqual(lineRange));
                if (!fullExists) {
                    // only add a none coverage if no full ones exist
                    coverageLines.none.push(lineRange);
                }
            }
        });
    }

    private filterBranchCoverage(
        section: Section,
        coverageLines: ICoverageLines,
    ) {
        if (!section || !section.branches) {
            return;
        }
        // TODO cleanup this area by using maps, filters, etc
        section.branches.details.forEach((detail) => {
            if (detail.taken === 0) {
                if (detail.line < 0) { return; }
                const partialRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
                if (coverageLines.full.find((range) => range.isEqual(partialRange))) {
                    // remove full coverage if partial is a better match
                    coverageLines.full = coverageLines.full.filter((range) => !range.isEqual(partialRange));
                    coverageLines.partial.push(partialRange);
                }
            }
        });
    }
}
