import {Section} from "lcov-parse";
import {
    Range,
    TextEditor,
} from "vscode";
import {IConfigStore} from "./config";
import {setLastCoverageLines} from "./exportsapi";
import {TopSectionFinder} from "./topSectionFinder";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

export class Renderer {
    private configStore: IConfigStore;
    private topSectionFinder: TopSectionFinder;

    constructor(
        configStore: IConfigStore,
        topSectionFinder: TopSectionFinder,
    ) {
        this.configStore = configStore;
        this.topSectionFinder = topSectionFinder;
    }

    /**
     * Renders coverage to editors
     * @param sections cached set of sections
     * @param textEditors currently visible text editors
     */
    public renderCoverage(
        sections: Map<string, Section>,
        textEditors: TextEditor[],
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

            // find best scoring section editor combo (or undefined if too low score)
            const topSection = this.topSectionFinder.findTopSectionForEditor(textEditor, sections);

            if (!topSection) { return ; }

            this.filterCoverage(topSection, coverageLines);
            this.setDecorationsForEditor(textEditor, coverageLines);

            // Cache last coverage lines for exports api
            setLastCoverageLines(coverageLines);
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

    private setDecorationsForEditor(
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

    private filterCoverage(
        section: Section,
        coverageLines: ICoverageLines,
    ) {
        if (!section) {
            return;
        }
        this.filterLineCoverage(section, coverageLines);
        this.filterBranchCoverage(section, coverageLines);
    }

    private filterLineCoverage(
        section: Section,
        coverageLines: ICoverageLines,
    ) {
        if (!section || !section.lines) {
            return;
        }
        // TODO cleanup this arears by using maps, filters, etc
        section.lines.details.forEach((detail) => {
            if (detail.line < 0) { return ; }
            const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            if (detail.hit > 0) {
                coverageLines.full.push(lineRange);
            } else {
                coverageLines.none.push(lineRange);
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
        section.branches.details.forEach((detail) => {
            if (detail.taken === 0) {
                if (detail.line < 0) { return ; }
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
