import {Section} from "lcov-parse";
import {TextEditor} from "vscode";

import {SectionFinder} from "../../src/coverage-system/sectionFinder";
import {fakeConfig} from "../mocks/fakeConfig";

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
        const sectionFinder: SectionFinder = new SectionFinder(fakeConfig, fakeOutput, fakeReporter as any);
        sectionFinder.findSectionForEditor(textEditor, sectionMap);
        return done();
    });
});
