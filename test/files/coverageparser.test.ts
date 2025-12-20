import CloverParser from "@cvrg-report/clover-json";
import { expect } from "chai";
import { Section } from "lcov-parse";
import sinon from "sinon";
import { OutputChannel } from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CoverageParser } from "../../src/files/coverageparser";

suite("CoverageParser Tests", () => {
    teardown(() => sinon.restore());

    const fakeOutputChannel = {
        appendLine: () => undefined,
    } as unknown as OutputChannel;

    test("filesToSections properly combines coverages @unit", async () => {
        const testFiles = new Map();
        const fileUnderTest = "./test-coverage.js";

        testFiles.set(
            "/unit/lcov.info",
            `TN:
            SF:${fileUnderTest}
            FN:1,test
            FNF:1
            FNH:1
            FNDA:2,test
            DA:1,1
            DA:2,2
            DA:3,0
            DA:6,2
            DA:7,0
            DA:10,2
            DA:11,1
            DA:14,1
            DA:15,1
            LF:9
            LH:7
            BRDA:2,1,0,0
            BRDA:2,1,1,2
            BRDA:6,2,0,0
            BRDA:6,2,1,2
            BRDA:10,3,0,1
            BRDA:10,3,1,1
            BRDA:14,4,0,1
            BRDA:14,4,1,0
            BRF:8
            BRH:5
            end_of_record`
        );
        testFiles.set(
            "./integration/lcov.info",
            `TN:
            SF:${fileUnderTest}
            FN:1,test
            FNF:1
            FNH:1
            FNDA:1,test
            DA:1,1
            DA:2,1
            DA:3,1
            DA:6,0
            DA:7,0
            DA:10,0
            DA:11,0
            DA:14,0
            DA:15,0
            LF:9
            LH:3
            BRDA:2,1,0,1
            BRDA:2,1,1,0
            BRDA:6,2,0,0
            BRDA:6,2,1,0
            BRDA:10,3,0,0
            BRDA:10,3,1,0
            BRDA:14,4,0,0
            BRDA:14,4,1,0
            BRF:8
            BRH:1
            end_of_record`
        );

        const coverageParsers = new CoverageParser(fakeOutputChannel);
        const testSections = await coverageParsers.filesToSections(testFiles);

        expect(testSections.size).to.equal(1);
        const section = testSections.get("::./test-coverage.js");
        expect(section?.lines).to.deep.equal({
            details: [
                { line: 1, hit: 2 },
                { line: 2, hit: 3 },
                { line: 3, hit: 1 },
                { line: 6, hit: 2 },
                { line: 7, hit: 0 },
                { line: 10, hit: 2 },
                { line: 11, hit: 1 },
                { line: 14, hit: 1 },
                { line: 15, hit: 1 },
            ],
            hit: 8,
            found: 9,
        });

        expect(section?.branches).to.deep.equal({
            details: [
                { line: 2, block: 1, branch: 0, taken: 1 },
                { line: 2, block: 1, branch: 1, taken: 2 },
                { line: 6, block: 2, branch: 0, taken: 0 },
                { line: 6, block: 2, branch: 1, taken: 2 },
                { line: 10, block: 3, branch: 0, taken: 1 },
                { line: 10, block: 3, branch: 1, taken: 1 },
                { line: 14, block: 4, branch: 0, taken: 1 },
                { line: 14, block: 4, branch: 1, taken: 0 },
            ],
            hit: 6,
            found: 8,
        });
    });

    test("filesToSections Correctly chooses the clover coverage format @unit", async () => {
        // Setup a map of test keys and data strings
        const testFiles = new Map();
        testFiles.set("/file/clover", "<?xml <coverage <project");

        const stubClover = sinon
            .stub(CloverParser, "parseContent")
            .resolves([{}] as Section[]);
        const coverageParsers = new CoverageParser(fakeOutputChannel);

        await coverageParsers.filesToSections(testFiles);

        expect(stubClover.calledWith("<?xml <coverage <project"));
    });

    test("parses C example Cobertura XML (gcovr) @integration", async () => {
        const xmlPath = path.join(__dirname, "..", "..", "..", "example", "c", "coverage.xml");
        const xmlContent = fs.readFileSync(xmlPath, "utf8");
        const files = new Map<string, string>([[xmlPath, xmlContent]]);

        const parser = new CoverageParser(fakeOutputChannel);
        const sections = await parser.filesToSections(files);

        expect(sections.size).to.be.greaterThan(0);
        const first = Array.from(sections.values())[0];
        expect(first.lines.found).to.be.greaterThan(0);
        expect(first.branches?.found).to.be.greaterThan(0);
    });

    test("parses C++ LLVM JSON export @integration", async () => {
        const jsonPath = path.join(__dirname, "..", "..", "..", "example", "cpp", "llvm-cov.json");
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const files = new Map<string, string>([[jsonPath, jsonContent]]);

        const parser = new CoverageParser(fakeOutputChannel);
        const sections = await parser.filesToSections(files);

        expect(sections.size).to.be.greaterThan(0);
        const first = Array.from(sections.values())[0];
        expect(first.lines.found).to.be.greaterThan(0);
        expect(first.branches?.found).to.be.greaterThan(0);
        // Ensure LLVM segments were attached for region hovers
        expect((first as any).__llvmSegmentsByLine).to.not.be.undefined;
    });
});
