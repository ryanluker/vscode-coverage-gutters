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

        // Line 11 is `<line number="11" hits="3" branch="true" condition-coverage="50% (3/6)">`
        const conditions = (first as Section & {
            __coberturaConditionsByLine?: Record<number, {
                coveragePercent: number,
                edgesCovered: number,
                edgesTotal: number,
                conditions: Array<{ number: number, type: string, coveragePercent: number }>,
            }>,
        }).__coberturaConditionsByLine;
        expect(conditions?.[11]).to.include({ coveragePercent: 50, edgesCovered: 3, edgesTotal: 6 });
        expect(conditions?.[11]?.conditions).to.deep.equal([
            { number: 0, type: "jump", coveragePercent: 50 },
        ]);
        // Self closing lines carry no conditions of their own
        expect(conditions?.[12]).to.include({ edgesTotal: 0 });
        expect(conditions?.[12]?.conditions).to.deep.equal([]);
    });

    test("applies Cobertura <source> roots to files @integration", async () => {
        const xmlPath = path.join(__dirname, "..", "..", "..", "example", "python", "cov.xml");
        const xmlContent = fs.readFileSync(xmlPath, "utf8");
        const files = new Map<string, string>([[xmlPath, xmlContent]]);

        const parser = new CoverageParser(fakeOutputChannel);
        const sections = await parser.filesToSections(files);

        const normalizedFiles = Array.from(sections.values()).map((section) => path.normalize(section.file));
        // The cov.xml has <source>/workspaces/vscode-coverage-gutters/example/python</source>
        // and files like python/foobar/tests/bar/a.py, so we should find both the relative paths
        // (from cobertura-parse) and the source-rooted absolute paths
        const relativePath = path.normalize(path.join("python", "foobar", "tests", "bar", "a.py"));
        const sourceRootedPath = path.normalize(path.join(
            "/workspaces/vscode-coverage-gutters/example/python",
            "python",
            "foobar",
            "tests",
            "bar",
            "a.py",
        ));

        expect(normalizedFiles).to.include(relativePath);
        expect(normalizedFiles).to.include(sourceRootedPath);
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

    test("attaches Cobertura conditions to every class, not just the last (#498) @unit", async () => {
        const classXml = (filename: string, line: number, covered: number) =>
            `<class name="${filename}" filename="${filename}" line-rate="1.0" branch-rate="0.5">` +
            `<methods/><lines>` +
            `<line number="${line}" hits="1" branch="true" condition-coverage="${covered * 50}% (${covered}/2)">` +
            `<conditions><condition number="0" type="jump" coverage="${covered * 50}%"/></conditions>` +
            `</line></lines></class>`;

        const xml = `<?xml version='1.0' encoding='UTF-8'?>` +
            `<coverage line-rate="1.0" branch-rate="0.5" version="gcovr 4.2">` +
            `<sources><source>.</source></sources>` +
            `<packages><package name="src" line-rate="1.0" branch-rate="0.5"><classes>` +
            classXml("first.c", 4, 1) +
            classXml("second.c", 9, 2) +
            `</classes></package></packages></coverage>`;

        const parser = new CoverageParser(fakeOutputChannel);
        const sections = await parser.filesToSections(new Map([["coverage.xml", xml]]));

        type WithConditions = Section & {
            __coberturaConditionsByLine?: Record<number, { edgesCovered: number, edgesTotal: number }>,
        };
        const byFile = new Map<string, WithConditions>();
        sections.forEach((section) => byFile.set(path.basename(section.file), section as WithConditions));

        // Before the fix the walker jumped straight to the next <class>, so only the
        // final class in the report ever kept its condition metadata.
        expect(byFile.get("first.c")?.__coberturaConditionsByLine?.[4])
            .to.include({ edgesCovered: 1, edgesTotal: 2 });
        expect(byFile.get("second.c")?.__coberturaConditionsByLine?.[9])
            .to.include({ edgesCovered: 2, edgesTotal: 2 });
    });
});
