import {Section} from "lcov-parse";
import {
    commands,
    OutputChannel,
    Range,
    TextEditor,
    Uri,
    ViewColumn,
} from "vscode";
import {IConfigStore} from "./config";
import {setLastCoverageLines} from "./exportsapi";

export interface ICoverageLines {
    full: Range[];
    partial: Range[];
    none: Range[];
}

export class Renderer {
    private configStore: IConfigStore;
    private outputChannel: OutputChannel;

    constructor(
        configStore: IConfigStore,
        outputChannel: OutputChannel,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
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

        textEditors.forEach((textEditor) => {
            // Reset lines for new editor
            coverageLines.full = [];
            coverageLines.none = [];
            coverageLines.partial = [];

            // find best scoring section editor combo (or undefined if too low score)
            const topSection = this.findTopSectionForEditor(textEditor, sections);

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

    /**
     * Compare the score of each editor / section combo and pick the best
     * @param textEditor editor to find best section for
     * @param sections sections to compare against open editors
     */
    private findTopSectionForEditor(
        textEditor: TextEditor,
        sections: Map<string, Section>,
    ): Section | undefined {
        const topSection: {score: number, section: Section|undefined} = {
            score: 0,
            section: undefined,
        };

        sections.forEach((section) => {
            const sectionFile = this.normalizeFileName(section.file);
            const editorFile = this.normalizeFileName(textEditor.document.fileName);

            const intersect = this.findIntersect(editorFile, sectionFile);
            if (!intersect) { return ; }

            // create a score to judge top "performing" editor
            // this score is the percent of the file path that is same as the intersect
            const score = (intersect.length / editorFile.length) * 100;
            if (topSection.score > score) { return ; }

            // new top
            topSection.section = section;
            topSection.score = score;
        });

        // capture score to logs
        if (topSection.section) {
            const template = `[${Date.now()}][renderer][section file path]: `;
            const message = template + `${topSection.section.file} [exactness score]: ${topSection.score}`;
            this.outputChannel.appendLine(message);
        }

        return topSection.section;
    }

    private findIntersect(base: string, comparee: string): string {
        const a = [...base].reverse();
        const b = [...comparee].reverse();

        // find the intersection and reverse it back into a string
        const intersection: string[] = [];
        let pos = 0;
        // stop when strings at pos are no longer are equal
        while (a[pos] === b[pos]) {
            // if we reached the end or there isnt a value for that pos
            // exit the while loop
            if (!a[pos] || !b[pos]) { break; }
            intersection.push(a[pos]);
            pos++;
        }
        const subInt = intersection.reverse().join("");
        return subInt;
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
