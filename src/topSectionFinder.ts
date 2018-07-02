import {Section} from "lcov-parse";
import {extname} from "path";
import {TextEditor} from "vscode";
import {OutputChannel} from "vscode";
import {findIntersect, normalizeFileName} from "./helpers";
import {Reporter} from "./reporter";

export class TopSectionFinder {

    private outputChannel: OutputChannel;
    private eventReporter: Reporter;

    constructor(
        outputChannel: OutputChannel,
        eventReporter: Reporter,
    ) {
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
    }

    /**
     * Compare the score of each editor / section combo and pick the best
     * @param textEditor editor to find best section for
     * @param sections sections to compare against open editors
     */
    public findTopSectionForEditor(
        textEditor: TextEditor,
        sections: Map<string, Section>,
    ): Section | undefined {
        const topSection: {score: number, section: Section|undefined} = {
            score: 0,
            section: undefined,
        };

        sections.forEach((section) => {
            const sectionFile = normalizeFileName(section.file);
            const editorFile = normalizeFileName(textEditor.document.fileName);

            const intersect = findIntersect(editorFile, sectionFile);
            if (!intersect) { return ; }

            // create a score to judge top "performing" editor
            // this score is the percent of the file path that is same as the intersect
            const score = (intersect.length / editorFile.length) * 100;
            if (topSection.score > score) { return ; }

            // new top
            topSection.section = section;
            topSection.score = score;
        });

        if (!topSection || !topSection.section || !topSection.score) { return ; }

        const filePath = topSection.section.file;
        const template = `[${Date.now()}][renderer][section file path]: `;
        const message = template + `${filePath} [exactness score]: ${topSection.score}`;
        this.outputChannel.appendLine(message);

        // log event and file type
        this.eventReporter.sendEvent("system", "renderer-correctness", topSection.score.toString());
        this.eventReporter.sendEvent("system", "renderer-fileType", extname(filePath));

        return topSection.section;
    }

}
