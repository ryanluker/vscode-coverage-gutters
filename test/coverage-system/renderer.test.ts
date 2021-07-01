import { expect } from "chai";
import { Section } from "lcov-parse";
import { DecorationOptions, Range, TextEditor, TextEditorDecorationType } from "vscode";
import { Renderer } from "../../src/coverage-system/renderer";
import { SectionFinder } from "../../src/coverage-system/sectionfinder";
import stubConfig from "../stubs/Config";

suite("Renderer Tests", function() {
    test("Constructor should setup properly @unit", function(done) {
        const sectionFinder: SectionFinder = {} as SectionFinder;
        expect(() => new Renderer(stubConfig, sectionFinder)).not.to.throw();
        return done();
    });

    test("renderCoverage should not error with empty map and empty TextEditor array @unit", function(done) {
        const sectionFinder: SectionFinder = {} as SectionFinder;
        const renderer: Renderer = new Renderer(stubConfig, sectionFinder);

        renderer.renderCoverage(new Map<string, Section>(), new Array<TextEditor>());
        return done();
    });

    test("renderCoverage should not error with empty map and single textEditor @unit", function(done) {
        const sections: Section[] = [{} as Section];
        const sectionFinder: SectionFinder = {
            findSectionsForEditor: (
                functionTextEditor: TextEditor,
                functionSections: Map<string, Section>,
            ): Section[] => {
                expect(functionTextEditor).not.to.equal(null);
                expect(functionSections).not.to.equal(null);
                return sections;
            },
        } as SectionFinder;
        const renderer: Renderer = new Renderer(stubConfig, sectionFinder);
        const textEditor: TextEditor = {} as TextEditor;

        textEditor.setDecorations = function(
            decorationType: TextEditorDecorationType,
            rangesOrOptions: Range[] | DecorationOptions[],
        ): void {
            const configArray = [
                stubConfig.fullCoverageDecorationType,
                stubConfig.noCoverageDecorationType,
                stubConfig.partialCoverageDecorationType,
            ];
            expect(configArray).to.include(decorationType);
            expect(rangesOrOptions).to.deep.equal([]);
        };
        const textEditorArray: TextEditor[] = new Array<TextEditor>();
        textEditorArray.push(textEditor);
        renderer.renderCoverage(new Map<string, Section>(), textEditorArray);
        return done();
    });

    test("removeDecorationsForEditor should not error @unit", function(done) {
        const sectionFinder: SectionFinder = {} as SectionFinder;
        const renderer: Renderer = new Renderer(stubConfig, sectionFinder);
        const textEditor: TextEditor = {} as TextEditor;

        textEditor.setDecorations = function(
            decorationType: TextEditorDecorationType,
            rangesOrOptions: Range[] | DecorationOptions[],
        ): void {
            const configArray = [
                stubConfig.fullCoverageDecorationType,
                stubConfig.noCoverageDecorationType,
                stubConfig.partialCoverageDecorationType,
            ];
            expect(configArray).to.include(decorationType);
            expect(rangesOrOptions).to.deep.equal([]);
        };
        renderer.removeDecorationsForEditor(textEditor);
        return done();
    });
});
