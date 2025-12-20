import { expect } from "chai";
import sinon from "sinon";
import { TextDocument, Position, Range, MarkdownString } from "vscode";
import { Section } from "lcov-parse";
import {
    BranchCoverageCodeLensProvider,
    BranchCoverageHoverProvider,
    RegionHighlighter,
} from "../../src/coverage-system/branchcoverageproviders";

suite("Branch Coverage Providers Tests", () => {
    let regionHighlighter: RegionHighlighter;

    setup(() => {
        regionHighlighter = new RegionHighlighter();
    });

    teardown(() => {
        regionHighlighter.dispose();
        sinon.restore();
    });

    const mockSection: Section = {
        title: "test",
        file: "/path/to/test.js",
        lines: {
            details: [
                { line: 1, hit: 1 },
                { line: 2, hit: 1 },
                { line: 3, hit: 0 },
            ],
            found: 3,
            hit: 2,
        },
        functions: {
            details: [{ line: 1, hit: 1, name: "test" }],
            found: 1,
            hit: 1,
        },
        branches: {
            details: [
                { line: 1, block: 0, branch: 0, taken: 1 },
                { line: 1, block: 0, branch: 1, taken: 0, condition_coverage: 50 },
                { line: 2, block: 1, branch: 0, taken: 1 },
                { line: 2, block: 1, branch: 1, taken: 1 },
            ],
            found: 4,
            hit: 3,
        },
    };

    test("CodeLens provider detects partial coverage lines @unit", () => {
        const provider = new BranchCoverageCodeLensProvider();
        const coverageData = new Map<string, Section>();
        coverageData.set("test::file", mockSection);
        provider.updateCoverageData(coverageData);

        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const codeLenses = provider.provideCodeLenses(mockDocument);
        
        // Should have CodeLens for line 1 (partial coverage: 1/2 branches taken)
        expect(codeLenses.length).to.equal(1);
        expect(codeLenses[0].range.start.line).to.equal(0); // Line 1 (0-indexed)
        expect(codeLenses[0].command?.title).to.include("1/2 branches taken");
    });

    test("CodeLens provider returns empty array when no partial coverage @unit", () => {
        const provider = new BranchCoverageCodeLensProvider();
        const mockFullCoverageSection: Section = {
            ...mockSection,
            branches: {
                details: [
                    { line: 2, block: 1, branch: 0, taken: 1 },
                    { line: 2, block: 1, branch: 1, taken: 1 },
                ],
                found: 2,
                hit: 2,
            },
        };

        const coverageData = new Map<string, Section>();
        coverageData.set("test::file", mockFullCoverageSection);
        provider.updateCoverageData(coverageData);

        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const codeLenses = provider.provideCodeLenses(mockDocument);
        expect(codeLenses.length).to.equal(0);
    });

    test("Hover provider returns branch details for partial coverage lines @unit", () => {
        const provider = new BranchCoverageHoverProvider(regionHighlighter);
        const coverageData = new Map<string, Section>();
        coverageData.set("test::file", mockSection);
        provider.updateCoverageData(coverageData);

        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const position = new Position(0, 0); // Line 1
        const hover = provider.provideHover(mockDocument, position);

        expect(hover).to.not.be.null;
        const contents = (hover as any).contents;
        const value = Array.isArray(contents) ? contents[0].value : contents.value;
        expect(value).to.include("1/2 branches taken");
        expect(value).to.include("50%");
    });

    test("Hover provider returns null for lines without branches @unit", () => {
        const provider = new BranchCoverageHoverProvider(regionHighlighter);
        const coverageData = new Map<string, Section>();
        coverageData.set("test::file", mockSection);
        provider.updateCoverageData(coverageData);

        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const position = new Position(2, 0); // Line 3 has no branches
        const hover = provider.provideHover(mockDocument, position);

        expect(hover).to.be.null;
    });

    test("Hover provider displays missing branches information @unit", () => {
        const sectionWithMissingBranches: Section = {
            ...mockSection,
            branches: {
                details: [
                    { line: 1, block: 0, branch: 0, taken: 1, missing_branches: [42, 43] },
                    { line: 1, block: 0, branch: 1, taken: 0, missing_branches: [42, 43] },
                ],
                found: 2,
                hit: 1,
            },
        };

        const provider = new BranchCoverageHoverProvider(regionHighlighter);
        const coverageData = new Map<string, Section>();
        coverageData.set("test::file", sectionWithMissingBranches);
        provider.updateCoverageData(coverageData);

        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const position = new Position(0, 0); // Line 1
        const hover = provider.provideHover(mockDocument, position);

        expect(hover).to.not.be.null;
        const contents = (hover as any).contents;
        const hoverText = Array.isArray(contents) ? contents[0].value : contents.value;
        expect(hoverText).to.include("Missing branch lines");
        expect(hoverText).to.include("42, 43");
    });

    test("CodeLens provider handles path normalization correctly @unit", () => {
        const provider = new BranchCoverageCodeLensProvider();
        const coverageData = new Map<string, Section>();
        // Add section with Windows-style path
        const sectionWithWindowsPath = { ...mockSection, file: "C:\\path\\to\\test.js" };
        coverageData.set("test::file", sectionWithWindowsPath);
        provider.updateCoverageData(coverageData);

        // Query with Unix-style path
        const mockDocument = {
            uri: { fsPath: "/path/to/test.js" },
        } as unknown as TextDocument;

        const codeLenses = provider.provideCodeLenses(mockDocument);
        // Should still match after normalization
        expect(codeLenses).to.not.be.empty;
    });
});
