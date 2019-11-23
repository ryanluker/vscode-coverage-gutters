import {Section} from "lcov-parse";
import {
    Range,
    TextEditor,
} from "vscode";
import {Config} from "../extension/config";
import {setLastCoverageLines} from "../extension/exportsapi";
import {SectionFinder} from "./sectionfinder";

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

            // find the section (or undefined) by looking relatively at each workspace
            // users can also optional use absolute instead of relative for this
            const foundsections = this.sectionFinder.findSectionsForEditor(textEditor, sections);

            if (foundsections.length == 0) { return ; }

            foundsections.forEach(section => {
                this.filterCoverage(section, coverageLines); 
            });
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
