import {Section} from "lcov-parse";
import {commands, Range, TextEditor, Uri, ViewColumn} from "vscode";
import {IConfigStore} from "./config";
import {setLastCoverageLines} from "./exportsapi";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

export class Renderer {
    private configStore: IConfigStore;

    constructor(configStore: IConfigStore) {
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

        textEditors.forEach((textEditor) => {
            // Remove all decorations first to prevent graphical issues
            this.removeDecorationsForEditor(textEditor);
        });

        sections.forEach((section) => {
            // Reset lines for new section
            coverageLines.full = [];
            coverageLines.none = [];
            coverageLines.partial = [];
            this.filterCoverage(section, coverageLines);

            textEditors.forEach((textEditor) => {
                const sectionFile = this.normalizeFileName(section.file);
                const editorFile = this.normalizeFileName(textEditor.document.fileName);

                if (!this.compareFileNames(editorFile, sectionFile)) { return ; }
                this.setDecorationsForEditor(textEditor, coverageLines);
                // Cache last coverage lines for exports api
                setLastCoverageLines(coverageLines);
            });
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

    private compareFileNames(base: string, comparee: string): boolean {
        const a = [...base].reverse();
        const b = [...comparee].reverse();

        // find the intersection and reverse it back into a string
        const intersection: string[] = [];
        let pos = 0;
        // stop when strings at pos are no longer are equal
        while (a[pos] === b[pos]) {
            intersection.push(a[pos]);
            pos++;
        }
        const subInt = intersection.reverse().join("");

        // prevent file names from returning true, the intersection must include ###'s
        // from the normalize process
        if (!subInt.includes("###")) { return false; }

        // if the whole intersection is present in base, return true
        return base.includes(subInt);
    }

    private normalizeFileName(fileName: string): string {
        let name = fileName;
        // make file path relative and OS independent
        name = name.toLocaleLowerCase();
        // remove all file slashes
        name = name.replace(/\//g, "###");
        name = name.replace(/\\/g, "###");
        return name;
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

        // apply partial coverage over full where it is more accurate
        if (section.branches) {
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
}
