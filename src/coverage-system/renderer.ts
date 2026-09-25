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
        // Aggregate coverage by line number to avoid duplicate entries when the same
        // file appears in multiple coverage reports (absolute and relative paths,
        // or when multiple test suites report the same file).
        const lineState = new Map<number, "full" | "partial" | "none">();

        sections.forEach((section) => {
            if (section?.lines?.details) {
                section.lines.details
                    .filter((detail) => detail.line > 0)
                    .forEach((detail) => {
                        const current = lineState.get(detail.line);
                        if (detail.hit > 0) {
                            // Keep partial precedence if it was already marked
                            if (current !== "partial") {
                                lineState.set(detail.line, "full");
                            }
                        } else if (!current) {
                            // Only set none if we have not seen coverage for the line
                            lineState.set(detail.line, "none");
                        }
                    });
            }

            if (section?.branches?.details) {
                section.branches.details
                    .filter((detail) => detail.line > 0 && detail.taken === 0)
                    .forEach((detail) => {
                        // Branch misses trump any previous state for the line
                        lineState.set(detail.line, "partial");
                    });
            }
        });

        coverageLines.full = [];
        coverageLines.none = [];
        coverageLines.partial = [];

        lineState.forEach((state, line) => {
            const range = new Range(line - 1, 0, line - 1, 0);
            if (state === "full") {
                coverageLines.full.push(range);
            } else if (state === "none") {
                coverageLines.none.push(range);
            } else {
                coverageLines.partial.push(range);
            }
        });
    }
}
