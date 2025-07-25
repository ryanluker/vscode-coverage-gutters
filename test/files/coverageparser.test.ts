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
        const fileUnderTest = "./test-coverage.js";

        testFiles.set(
            "/unit/lcov.info",
            `TN:
            SF:${fileUnderTest}
            FN:1,test
            FN:42,callbackBased
            FN:46,subTest
            FNF:3
            FNH:3
            FNDA:5,test
            FNDA:6,callbackBased
            FNDA:9,subTest
            DA:1,1
            DA:2,5
            DA:3,0
            DA:6,5
            DA:7,0
            DA:10,5
            DA:11,0
            DA:14,5
            DA:15,5
            DA:16,0
            DA:19,5
            DA:20,0
            DA:23,5
            DA:24,4
            DA:26,3
            DA:31,3
            DA:32,3
            DA:35,3
            DA:37,3
            DA:39,3
            DA:42,1
            DA:43,6
            DA:46,1
            DA:47,9
            DA:48,9
            LF:25
            LH:20
            BRDA:2,1,0,0
            BRDA:2,1,1,5
            BRDA:6,2,0,0
            BRDA:6,2,1,5
            BRDA:10,3,0,0
            BRDA:10,3,1,5
            BRDA:15,4,0,0
            BRDA:15,4,1,5
            BRDA:19,5,0,0
            BRDA:19,5,1,5
            BRDA:23,6,0,1
            BRDA:23,6,1,4
            BRDA:24,7,0,1
            BRDA:24,7,1,3
            BRDA:31,8,0,3
            BRDA:31,8,1,0
            BRDA:31,9,0,3
            BRDA:31,9,1,3
            BRDA:31,9,2,3
            BRDA:32,10,0,3
            BRDA:32,10,1,0
            BRDA:35,11,0,0
            BRDA:35,11,1,3
            BRF:23
            BRH:15
            end_of_record`
        );
        testFiles.set(
            "./integration/lcov.info",
            `TN:
            SF:${fileUnderTest}
            FN:6,(anonymous_1)
            FN:7,(anonymous_2)
            FNF:2
            FNH:2
            FNDA:1,(anonymous_1)
            FNDA:1,(anonymous_2)
            DA:3,1
            DA:4,1
            DA:6,1
            DA:7,1
            DA:8,1
            DA:9,1
            LF:6
            LH:6
            BRF:0
            BRH:0
            end_of_record
            TN:
            SF:${fileUnderTest}
            FN:1,test
            FN:42,callbackBased
            FN:46,subTest
            FNF:3
            FNH:1
            FNDA:1,test
            FNDA:0,callbackBased
            FNDA:0,subTest
            DA:1,1
            DA:2,1
            DA:3,1
            DA:6,0
            DA:7,0
            DA:10,0
            DA:11,0
            DA:14,0
            DA:15,0
            DA:16,0
            DA:19,0
            DA:20,0
            DA:23,0
            DA:24,0
            DA:26,0
            DA:31,0
            DA:32,0
            DA:35,0
            DA:37,0
            DA:39,0
            DA:42,1
            DA:43,0
            DA:46,1
            DA:47,0
            DA:48,0
            LF:25
            LH:5
            BRDA:2,1,0,1
            BRDA:2,1,1,0
            BRDA:6,2,0,0
            BRDA:6,2,1,0
            BRDA:10,3,0,0
            BRDA:10,3,1,0
            BRDA:15,4,0,0
            BRDA:15,4,1,0
            BRDA:19,5,0,0
            BRDA:19,5,1,0
            BRDA:23,6,0,0
            BRDA:23,6,1,0
            BRDA:24,7,0,0
            BRDA:24,7,1,0
            BRDA:31,8,0,0
            BRDA:31,8,1,0
            BRDA:31,9,0,0
            BRDA:31,9,1,0
            BRDA:31,9,2,0
            BRDA:32,10,0,0
            BRDA:32,10,1,0
            BRDA:35,11,0,0
            BRDA:35,11,1,0
            BRF:23
            BRH:1
            end_of_record`
        );

        const coverageParsers = new CoverageParser(fakeOutputChannel);
        const testSections = await coverageParsers.filesToSections(testFiles);

        expect(testSections.size).to.equal(1);
        const section = testSections.get("./test-coverage.js");
        expect(section).to.deep.equal({
            lines: {
                details: [
                    {
                        line: 1,
                        hit: 2,
                    },
                    {
                        line: 2,
                        hit: 6,
                    },
                    {
                        line: 3,
                        hit: 1,
                    },
                    {
                        line: 6,
                        hit: 5,
                    },
                    {
                        line: 7,
                        hit: 0,
                    },
                    {
                        line: 10,
                        hit: 5,
                    },
                    {
                        line: 11,
                        hit: 0,
                    },
                    {
                        line: 14,
                        hit: 5,
                    },
                    {
                        line: 15,
                        hit: 5,
                    },
                    {
                        line: 16,
                        hit: 0,
                    },
                    {
                        line: 19,
                        hit: 5,
                    },
                    {
                        line: 20,
                        hit: 0,
                    },
                    {
                        line: 23,
                        hit: 5,
                    },
                    {
                        line: 24,
                        hit: 4,
                    },
                    {
                        line: 26,
                        hit: 3,
                    },
                    {
                        line: 31,
                        hit: 3,
                    },
                    {
                        line: 32,
                        hit: 3,
                    },
                    {
                        line: 35,
                        hit: 3,
                    },
                    {
                        line: 37,
                        hit: 3,
                    },
                    {
                        line: 39,
                        hit: 3,
                    },
                    {
                        line: 42,
                        hit: 2,
                    },
                    {
                        line: 43,
                        hit: 6,
                    },
                    {
                        line: 46,
                        hit: 2,
                    },
                    {
                        line: 47,
                        hit: 9,
                    },
                    {
                        line: 48,
                        hit: 9,
                    },
                ],
                hit: 21,
                found: 25,
            },
            functions: {
                hit: 3,
                found: 3,
                details: [
                    {
                        name: "test",
                        line: 1,
                        hit: 5,
                    },
                    {
                        name: "callbackBased",
                        line: 42,
                        hit: 6,
                    },
                    {
                        name: "subTest",
                        line: 46,
                        hit: 9,
                    },
                ],
            },
            branches: {
                details: [
                    {
                        line: 2,
                        block: 1,
                        branch: 0,
                        taken: 1,
                    },
                    {
                        line: 2,
                        block: 1,
                        branch: 1,
                        taken: 5,
                    },
                    {
                        line: 6,
                        block: 2,
                        branch: 0,
                        taken: 0,
                    },
                    {
                        line: 6,
                        block: 2,
                        branch: 1,
                        taken: 5,
                    },
                    {
                        line: 10,
                        block: 3,
                        branch: 0,
                        taken: 0,
                    },
                    {
                        line: 10,
                        block: 3,
                        branch: 1,
                        taken: 5,
                    },
                    {
                        line: 15,
                        block: 4,
                        branch: 0,
                        taken: 0,
                    },
                    {
                        line: 15,
                        block: 4,
                        branch: 1,
                        taken: 5,
                    },
                    {
                        line: 19,
                        block: 5,
                        branch: 0,
                        taken: 0,
                    },
                    {
                        line: 19,
                        block: 5,
                        branch: 1,
                        taken: 5,
                    },
                    {
                        line: 23,
                        block: 6,
                        branch: 0,
                        taken: 1,
                    },
                    {
                        line: 23,
                        block: 6,
                        branch: 1,
                        taken: 4,
                    },
                    {
                        line: 24,
                        block: 7,
                        branch: 0,
                        taken: 1,
                    },
                    {
                        line: 24,
                        block: 7,
                        branch: 1,
                        taken: 3,
                    },
                    {
                        line: 31,
                        block: 8,
                        branch: 0,
                        taken: 3,
                    },
                    {
                        line: 31,
                        block: 8,
                        branch: 1,
                        taken: 0,
                    },
                    {
                        line: 31,
                        block: 9,
                        branch: 0,
                        taken: 3,
                    },
                    {
                        line: 31,
                        block: 9,
                        branch: 1,
                        taken: 3,
                    },
                    {
                        line: 31,
                        block: 9,
                        branch: 2,
                        taken: 3,
                    },
                    {
                        line: 32,
                        block: 10,
                        branch: 0,
                        taken: 3,
                    },
                    {
                        line: 32,
                        block: 10,
                        branch: 1,
                        taken: 0,
                    },
                    {
                        line: 35,
                        block: 11,
                        branch: 0,
                        taken: 0,
                    },
                    {
                        line: 35,
                        block: 11,
                        branch: 1,
                        taken: 3,
                    },
                ],
                hit: 16,
                found: 23,
            },
            title: "",
            file: "./test-coverage.js",
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
});
