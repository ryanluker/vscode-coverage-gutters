import {assert} from "chai";
import {Section} from "lcov-parse";
import {DecorationOptions, Range, TextEditor, TextEditorDecorationType} from "vscode";
import {Renderer} from "../../src/coverage-system/renderer";
import {SectionFinder} from "../../src/coverage-system/sectionFinder";
import { fakeConfig } from "../mocks/fakeConfig";

suite("Renderer Tests", function() {
    test("Constructor should setup properly @unit", function(done) {
        const sectionFinder: SectionFinder = {} as SectionFinder;
        assert.doesNotThrow(() => new Renderer(fakeConfig, sectionFinder));
        return done();
    });

    test("renderCoverage should not error with empty map and empty TextEditor array @unit", function(done) {
        const sectionFinder: SectionFinder = {} as SectionFinder;
        const renderer: Renderer = new Renderer(fakeConfig, sectionFinder);
        renderer.renderCoverage(new Map<string, Section>(), new Array<TextEditor>());
        return done();
    });

    test("renderCoverage should not error with empty map and single textEditor @unit", function(done) {
        const section: Section = {} as Section;

        const sectionFinder: SectionFinder = {
            findSectionForEditor: (
                functionTextEditor: TextEditor,
                functionSections: Map<string, Section>,
            ): Section | undefined => {
                assert.isNotNull(functionTextEditor);
                assert.isNotNull(functionSections);
                return section;
            },
        } as SectionFinder;

        const renderer: Renderer = new Renderer(fakeConfig, sectionFinder);
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
        const sectionFinder: SectionFinder = {} as SectionFinder;
        const renderer: Renderer = new Renderer(fakeConfig, sectionFinder);
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
