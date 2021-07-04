import CloverParser from "@cvrg-report/clover-json";
import { expect } from "chai";
import { Section } from "lcov-parse";
import sinon from "sinon";
import { OutputChannel } from "vscode";
import { CoverageParser } from "../../src/files/coverageparser";

suite("CoverageParser Tests", () => {
    teardown(() => sinon.restore());

    const fakeOutputChannel = { appendLine: () => undefined } as unknown as OutputChannel;

    test("filesToSections properly deduplicates coverages @unit", async () => {
        // Setup a map of test keys and data strings
        // Note: we include a duplicate key to test deduplication
        const testFiles = new Map();
        testFiles.set("/file/123", "datastringhere");
        testFiles.set("/file/111", "datastring111");
        testFiles.set("/file/222", "datastring222");
        testFiles.set("/file/123", "samestringhere");

        const coverageParsers = new CoverageParser(fakeOutputChannel);
        sinon.stub(coverageParsers as any, "lcovExtract").callsFake(async (filename) => {
            const testSection = new Map();
            testSection.set(filename, "");
            return testSection;
        });

        const testSections = await coverageParsers.filesToSections(testFiles);

        // Check that we removed the duplicate coverage
        expect(testSections.size).to.equal(3);
    });

    test("filesToSections Correctly chooses the clover coverage format @unit", async () => {
        // Setup a map of test keys and data strings
        const testFiles = new Map();
        testFiles.set("/file/clover", "<?xml <coverage <project");

        const stubClover = sinon.stub(CloverParser, "parseContent").resolves([{}] as Section[]);
        const coverageParsers = new CoverageParser(fakeOutputChannel);

        await coverageParsers.filesToSections(testFiles);

        expect(stubClover).to.be.calledWith("<?xml <coverage <project");
    });
});
