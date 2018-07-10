import {assert} from "chai";
import {Section} from "lcov-parse";
import {DecorationOptions, Range, TextEditor, TextEditorDecorationType} from "vscode";
import {Renderer} from "../src/renderer";
import { TopSectionFinder } from "../src/topSectionFinder";

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
        sectionMatchThreshold: 50,
    };

    test("Constructor should setup properly @unit", function(done) {
        const topSectionFinder: TopSectionFinder = {} as TopSectionFinder;
        assert.doesNotThrow(() => new Renderer(fakeConfig, topSectionFinder));
        return done();
    });

    test("renderCoverage should not error with empty map and empty TextEditor array @unit", function(done) {
        const topSectionFinder: TopSectionFinder = {} as TopSectionFinder;
        const renderer: Renderer = new Renderer(fakeConfig, topSectionFinder);
        renderer.renderCoverage(new Map<string, Section>(), new Array<TextEditor>());
        return done();
    });

    test("renderCoverage should not error with empty map and single textEditor @unit", function(done) {
        const section: Section = {} as Section;

        const topSectionFinder: TopSectionFinder = {
            findTopSectionForEditor: (
                functionTextEditor: TextEditor,
                functionSections: Map<string, Section>,
            ): Section | undefined => {
                assert.isNotNull(functionTextEditor);
                assert.isNotNull(functionSections);
                return section;
            },
        } as TopSectionFinder;

        const renderer: Renderer = new Renderer(fakeConfig, topSectionFinder);
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
        const topSectionFinder: TopSectionFinder = {} as TopSectionFinder;
        const renderer: Renderer = new Renderer(fakeConfig, topSectionFinder);
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
