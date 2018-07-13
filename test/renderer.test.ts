import {assert} from "chai";
import {Section} from "lcov-parse";
import {DecorationOptions, Range, TextEditor, TextEditorDecorationType} from "vscode";
import {Renderer} from "../src/renderer";

suite("Renderer Tests", function() {
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
        showStatusBarToggler: true,
        xmlFileName: "test.xml",
    };

    test("Constructor should setup properly @unit", function(done) {
        assert.doesNotThrow(() => new Renderer(fakeConfig));
        return done();
    });

    test("renderCoverage should not error with empty map and empty TextEditor array @unit", function(done) {
        const renderer: Renderer = new Renderer(fakeConfig);
        renderer.renderCoverage(new Map<string, Section>(), new Array<TextEditor>());
        return done();
    });

    test("renderCoverage should not error with empty map and single textEditor @unit", function(done) {
        const section: Section = {} as Section;

        const renderer: Renderer = new Renderer(fakeConfig);
        const textEditor: TextEditor = {} as TextEditor;

        textEditor.setDecorations = function(
            decorationType: TextEditorDecorationType,
            rangesOrOptions: Range[] | DecorationOptions[],
        ): void {
            const configArray = [
                fakeConfig.fullCoverageDecorationType,
                fakeConfig.noCoverageDecorationType,
                fakeConfig.partialCoverageDecorationType,
            ];
            assert.include(configArray, decorationType);
            assert.isArray(rangesOrOptions);
            assert.equal(rangesOrOptions.length, 0);
        };
        const textEditorArray: TextEditor[] = new Array<TextEditor>();
        textEditorArray.push(textEditor);
        renderer.renderCoverage(new Map<string, Section>(), textEditorArray);
        return done();
    });

    test("removeDecorationsForEditor should not error @unit", function(done) {
        const renderer: Renderer = new Renderer(fakeConfig);
        const textEditor: TextEditor = {} as TextEditor;
        textEditor.setDecorations = function(
            decorationType: TextEditorDecorationType,
            rangesOrOptions: Range[] | DecorationOptions[],
        ): void {
            const configArray = [
                fakeConfig.fullCoverageDecorationType,
                fakeConfig.noCoverageDecorationType,
                fakeConfig.partialCoverageDecorationType,
            ];
            assert.include(configArray, decorationType);
            assert.isArray(rangesOrOptions);
            assert.equal(rangesOrOptions.length, 0);
        };
        renderer.removeDecorationsForEditor(textEditor);
        return done();
    });
});
