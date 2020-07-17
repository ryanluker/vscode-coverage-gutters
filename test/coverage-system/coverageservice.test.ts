import * as assert from "assert";
import {OutputChannel, workspace} from "vscode";

import {CoverageService} from "../../src/coverage-system/coverageservice";

const mockOutputChannel = {appendLine: (x) => {}} as OutputChannel;

// Original functions
const createFileSystemWatcher = workspace.createFileSystemWatcher;

suite("CoverageService Tests", function() {
    teardown(function() {
        (workspace as any).createFileSystemWatcher = createFileSystemWatcher;
    });

    test("Should listen for all paths specified in manualCoverageFilePaths @unit", function(done) {
        const config: any = {
            manualCoverageFilePaths: [
                "/path1",
                "/path2",
            ],
        };
        const service = new CoverageService(config, mockOutputChannel);

        let globPassed;
        (workspace as any).createFileSystemWatcher = (glob) => {
            globPassed = glob;
            return {
                onDidChange: (fn) => {},
                onDidCreate: (fn) => {},
                onDidDelete: (fn) => {},
            };
        };
        (service as any).listenToFileSystem();

        assert.equal(globPassed, "{/path1,/path2}");
    });
});
