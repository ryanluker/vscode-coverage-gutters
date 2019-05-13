import * as assert from "assert";
import * as fs from "fs";

import {FilesLoader} from "../../src/files/filesloader";
import {fakeConfig} from "../mocks/fakeConfig";

// Original functions
const readFile = fs.readFile;

suite("FilesLoader Tests", function() {
    teardown(function() {
        (fs as any).readFile = readFile;
    });

    test("loadDataFiles takes file paths and fetches their data strings @unit", async function() {
        // tslint:disable-next-line
        const readFile = function(path: string, cb) {
            return cb(undefined, Buffer.from("123"));
        };
        (fs as any).readFile = readFile;

        const filesLoader = new FilesLoader(fakeConfig);
        const testData = new Set(["file1", "file2"]);
        return filesLoader.loadDataFiles(testData)
            .then(function(mapData) {
                assert.equal(2, mapData.size);
                assert.equal("123", mapData.get("file1"));
            });
    });

    test("findCoverageFiles returns an error if no coverage file @unit", async function() {
        const filesLoader = new FilesLoader(fakeConfig);
        (filesLoader as any).findCoverageInWorkspace = async () => new Map();
        
        return assert.rejects(
            filesLoader.findCoverageFiles.bind(filesLoader),
            Error("Could not find a Coverage file!")
        );
    });
});
