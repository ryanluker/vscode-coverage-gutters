import { Section } from "lcov-parse";
import {
    Range,
    TextEditor,
    DecorationOptions
} from "vscode";
import { Config } from "../extension/config";
import { SectionFinder } from "./sectionfinder";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
    hitCounts: Map<number, number>;
}

export class Renderer {
    private configStore: Config;
    private sectionFinder: SectionFinder;
    private maxHitCount: number = 0;

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
            hitCounts: new Map(),
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
            coverageLines.hitCounts = new Map();
            this.maxHitCount = 0;

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
        
        // Clean up hit count decorations if they exist
        editor.setDecorations(this.configStore.hitCountDecorationType, []);
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
        
        // Apply hit count decorations if enabled
        if (this.configStore.showHitCounts) {
            this.setHitCountDecorations(editor, coverage);
        }
    }

    private setHitCountDecorations(
        editor: TextEditor,
        coverage: ICoverageLines,
    ) {
        const hitCountDecorations: DecorationOptions[] = [];
        
        const paddingWidth = this.maxHitCount.toString().length;
        
        const addEmptyPadding = (startLine: number, endLine: number) => {
            for (let line = startLine; line <= endLine; line++) {
                hitCountDecorations.push({
                    range: new Range(line, 0, line, 0),
                    renderOptions: {
                        before: {
                            // We use this special invisible character for the margin since spaces are trimmed
                            contentText: '\u00A0'.repeat(paddingWidth) + '\u00A0',
                        }
                    }
                });
            }
        };

        let lastLineNumber = -1;

        // Create decorations for all lines with coverage data
        coverage.hitCounts.forEach((hitCount, lineNumber) => {
            if (lineNumber > lastLineNumber + 1) {
                addEmptyPadding(lastLineNumber + 1, lineNumber - 1);
            }
            
            const range = new Range(lineNumber, 0, lineNumber, 0);
            const paddedHitCount = hitCount.toString().padStart(paddingWidth, '\u00A0');
            
            hitCountDecorations.push({
                range,
                renderOptions: {
                    before: {
                        contentText: paddedHitCount + '\u00A0',
                    }
                }
            });
            
            lastLineNumber = lineNumber;
        });

        // Fill gap at end of file if needed
        if (lastLineNumber < editor.document.lineCount - 1) {
            addEmptyPadding(lastLineNumber + 1, editor.document.lineCount - 1);
        }

        editor.setDecorations(this.configStore.hitCountDecorationType, hitCountDecorations);
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
        section.lines.details
        .filter((detail) => detail.line > 0)
        .forEach((detail) => {
            const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            
            // Store hit count for this line
            coverageLines.hitCounts.set(detail.line - 1, detail.hit);
            this.maxHitCount = Math.max(this.maxHitCount, detail.hit);
            
            if (detail.hit > 0) {
                // Evaluates to true if at least one element in range is equal to LineRange
                if (coverageLines.none.some((range) => range.isEqual(lineRange))) {
                    coverageLines.none = coverageLines.none.filter((range) => !range.isEqual(lineRange))
                }
                coverageLines.full.push(lineRange);
            } else {
                if (!coverageLines.full.some((range) => range.isEqual(lineRange))) {
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
        section.branches.details
        .filter((detail) => detail.taken === 0 && detail.line > 0)
        .forEach((detail) => {
            const partialRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
            // Evaluates to true if at least one element in range is equal to partialRange
            if (coverageLines.full.some((range) => range.isEqual(partialRange))){
                coverageLines.full = coverageLines.full.filter((range) => !range.isEqual(partialRange));
                coverageLines.partial.push(partialRange);
            }
        });
    }
}
