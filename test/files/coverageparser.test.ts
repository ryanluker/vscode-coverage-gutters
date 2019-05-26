import * as assert from "assert";
import {CoverageParser} from "../../src/files/coverageparser";

suite("CoverageParser Tests", function() {
    test("filesToSections properly deduplicates coverages @unit", async function() {
        // Setup a map of test keys and data strings
        // Note: we include a duplicate key to test deduplication
        const testFiles = new Map();
        testFiles.set("/file/123", "datastringhere");
        testFiles.set("/file/111", "datastring111");
        testFiles.set("/file/222", "datastring222");
        testFiles.set("/file/123", "samestringhere");

        // Mock lcovExtract
        const lcovExtract = async (filename) => {
            const testSection = new Map();
            testSection.set(filename, '');
            return testSection;
        };
        const coverageParsers = new CoverageParser({} as any, {} as any);
        (coverageParsers as any).lcovExtract = lcovExtract;

        return coverageParsers.filesToSections(testFiles)
            .then((testSections) => {
                // Check that we removed the duplicate coverage
                assert.equal(testSections.size, 3);
            });
    });

    test("filesToSections Correctly chooses the clover coverage format @unit", async function() {
        // Setup a map of test keys and data strings
        const testFiles = new Map();
        testFiles.set("/file/clover", "<?xml <coverage <project");

        // Mock xmlExtract where we check we are called
        let wasCalled = false;
        const cloverExtract = async (filename) => {
            wasCalled = true;
            assert.equal(testFiles.has(filename), true)
            return new Map();
        };
        const coverageParsers = new CoverageParser({} as any, {} as any);
        (coverageParsers as any).xmlExtractClover = cloverExtract;

        return coverageParsers.filesToSections(testFiles)
            .then(() => {
                // Check that we called the clover extract
                assert.equal(wasCalled, true);
            });
    });
});
