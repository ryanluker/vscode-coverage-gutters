import {Section} from "lcov-parse";
import {commands, Range, TextEditor, Uri, ViewColumn} from "vscode";
import {IConfigStore as ConfigStore} from "./config";

interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

export class Renderer {
    private configStore: ConfigStore;

    constructor(configStore: ConfigStore) {
        this.configStore = configStore;
    }

    /**
     * Renders coverage to editors
     * @param sections cached set of sections
     * @param textEditors currently visible text editors
     */
    public async renderCoverage(
        sections: Map<string, Section>,
        textEditors: TextEditor[],
    ) {
        const coverageLines: ICoverageLines = {
            full: [],
            none: [],
            partial: [],
        };

        sections.forEach((section) => {
            // Reset lines for new section
            coverageLines.full = [];
            coverageLines.none = [];
            coverageLines.partial = [];
            this.filterCoverage(section, coverageLines);

            textEditors.forEach((textEditor) => {
                // Check if current editor file is the current section
                if (textEditor.document.fileName !== section.file) { return ; }
                this.setDecorationsForEditor(textEditor, coverageLines);
            });
        });
    }

    public async displayReport(reportPath: string) {
        const reportUri = Uri.file(reportPath);
        await commands.executeCommand(
            "vscode.previewHtml",
            reportUri,
            ViewColumn.One,
            "Preview Coverage Report",
        );
    }

    private setDecorationsForEditor(
        editor: TextEditor,
        coverage: ICoverageLines,
    ) {
        // remove existing coverage first to prevent graphical conflicts
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

        if (section.branches) {
            section.branches.details.forEach((detail) => {
                if (detail.branch === 0 && detail.taken === 0) {
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
}
