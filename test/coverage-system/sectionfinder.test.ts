import {Section} from "lcov-parse";
import {TextEditor} from "vscode";

import {SectionFinder} from "../../src/coverage-system/sectionfinder";
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
        (textEditor as any).document = {};
        (textEditor as any).document.fileName = "test123.ts";
        const sectionMap: Map<string, Section> = new Map<string, Section>();
        const sectionFinder: SectionFinder = new SectionFinder(fakeConfig, fakeOutput, fakeReporter as any);
        sectionFinder.findSectionsForEditor(textEditor, sectionMap);
        return done();
    });
});
