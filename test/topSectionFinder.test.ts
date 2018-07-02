import {assert} from "chai";
import {Section} from "lcov-parse";
import {DecorationOptions, Range, TextEditor, TextEditorDecorationType} from "vscode";
import { TopSectionFinder } from "../src/topSectionFinder";

suite("TopSectionFinder Tests", function() {

    const fakeOutput = {
        append: () => {},
        appendLine: () => {},
        clear: () => {},
        dispose: () => {},
        hide: () => {},
        name: "fake",
        show: () => {},
    };

    const fakeReporter = {
        sendEvent: () => {},
    };

    test("Should do a thing @unit", function(done) {
        const textEditor: TextEditor = {} as TextEditor;
        const sectionMap: Map<string, Section> = new Map<string, Section>();
        const topSectionFinder: TopSectionFinder = new TopSectionFinder(fakeOutput, fakeReporter as any);
        topSectionFinder.findTopSectionForEditor(textEditor, sectionMap);
        return done();
    });
});
