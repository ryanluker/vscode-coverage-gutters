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

    const fakeConfig = {
        altSfCompare: false,
        fullCoverageDecorationType: {
            key: "testKey",
            dispose() {},
        },
        lcovFileName: "test.ts",
        noCoverageDecorationType: {
            key: "testKey4",
            dispose() {},
        },
        partialCoverageDecorationType: {
            key: "testKey3",
            dispose() {},
        },
        sectionMatchThreshold: 50,
        showStatusBarToggler: true,
        xmlFileName: "test.xml",
    };

    test("Should not throw an error @unit", function(done) {
        const textEditor: TextEditor = {} as TextEditor;
        const sectionMap: Map<string, Section> = new Map<string, Section>();
        const topSectionFinder: TopSectionFinder = new TopSectionFinder(fakeOutput, fakeReporter as any, fakeConfig);
        topSectionFinder.findTopSectionForEditor(textEditor, sectionMap);
        return done();
    });
});
