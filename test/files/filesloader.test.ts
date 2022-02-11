import { expect } from "chai";
import fs, { PathLike } from "fs";
import sinon from "sinon";
import * as vscode from "vscode";
import { Config } from "../../src/extension/config";

import { FilesLoader } from "../../src/files/filesloader";

const stubConfig = sinon.createStubInstance(Config) as Config;

suite("FilesLoader Tests", () => {
    teardown(() => sinon.restore());

    test("loadDataFiles takes file paths and fetches their data strings @unit", async () => {
        sinon.stub(fs, "readFile").callsFake(
            (_: number | PathLike, cb: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
                return cb(null, Buffer.from("123"));
            },
        );

        const filesLoader = new FilesLoader(stubConfig);
        const testData = new Set(["file1", "file2"]);
        const mapData = await filesLoader.loadDataFiles(testData);

        expect(mapData.size).to.equal(2);
        expect(mapData.get("file1")).to.equal("123");

    });

    test("findCoverageFiles returns an error if no coverage file @unit", async () => {
        stubConfig.manualCoverageFilePaths = [];
        stubConfig.coverageFileNames = ["lcov.info"];
        const filesLoader = new FilesLoader(stubConfig);
        sinon.stub(filesLoader as any, "findCoverageInWorkspace").resolves(new Map());

        const stubShowWarningMessage = sinon.spy(vscode.window, "showWarningMessage");

        await filesLoader.findCoverageFiles();
        expect(stubShowWarningMessage).to.be.calledWith("Could not find a Coverage file! Searched for lcov.info");
    });

    test("findCoverageFiles returns manual coverage paths if set @unit", async () => {
        const coverageFiles = ["test.js", "test2.js"];
        stubConfig.manualCoverageFilePaths = coverageFiles;
        const filesLoader = new FilesLoader(stubConfig);
        const files = await filesLoader.findCoverageFiles();
        expect(new Set(coverageFiles)).to.deep.equal(files);
    });
});
