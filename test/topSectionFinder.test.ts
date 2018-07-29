import {assert} from "chai";
import {Section} from "lcov-parse";
import {DecorationOptions, Range, TextEditor, TextEditorDecorationType} from "vscode";
import {SectionFinder} from "../src/sectionFinder";

suite("SectionFinder Tests", function() {

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

    test("Should not throw an error @unit", function(done) {
        const textEditor: TextEditor = {} as TextEditor;
        const sectionMap: Map<string, Section> = new Map<string, Section>();
        const sectionFinder: SectionFinder = new SectionFinder(fakeOutput, fakeReporter as any);
        sectionFinder.findSectionForEditor(textEditor, sectionMap);
        return done();
    });
});
