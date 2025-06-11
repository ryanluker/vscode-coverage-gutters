import CloverParser from "@cvrg-report/clover-json";
import { expect } from "chai";
import { Section } from "lcov-parse";
import sinon from "sinon";
import { OutputChannel } from "vscode";
import { CoverageParser } from "../../src/files/coverageparser";

suite("CoverageParser Tests", () => {
    teardown(() => sinon.restore());

    const fakeOutputChannel = {
        appendLine: () => undefined,
    } as unknown as OutputChannel;

    test("filesToSections properly combines coverages @unit", async () => {
        const testFiles = new Map();

        testFiles.set(
            "/unit.lcov",
            "TN:test line\nSF: ./dup-coverage.js\nLF: 1\nLH: 0\nDA: 1,0\nBRF:0\nBRH:0\nend_of_record"
        );
        testFiles.set(
            "/integration.lcov",
            "TN:test line\nSF: ./dup-coverage.js\nLF: 1\nLH: 1\nDA: 1,1\nBRF:0\nBRH:0\nend_of_record"
        );

        const coverageParsers = new CoverageParser(fakeOutputChannel);
        const testSections = await coverageParsers.filesToSections(testFiles);

        expect(testSections.size).to.equal(2);
    });

    test("filesToSections Correctly chooses the clover coverage format @unit", async () => {
        // Setup a map of test keys and data strings
        const testFiles = new Map();
        testFiles.set("/file/clover", "<?xml <coverage <project");

        const stubClover = sinon.stub(CloverParser, "parseContent").resolves([{}] as Section[]);
        const coverageParsers = new CoverageParser(fakeOutputChannel);

        await coverageParsers.filesToSections(testFiles);

        expect(stubClover.calledWith("<?xml <coverage <project"));
    });
});
