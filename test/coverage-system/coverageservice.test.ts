import * as assert from "assert";
import {OutputChannel, workspace} from "vscode";

import {CoverageService} from "../../src/coverage-system/coverageservice";

const mockOutputChannel = {appendLine: (x) => {}} as OutputChannel;
const mockFileWatcher = {
    dispose: () => {},
    onDidChange: (fn) => {},
    onDidCreate: (fn) => {},
    onDidDelete: (fn) => {},
};

// Original functions
const createFileSystemWatcher = workspace.createFileSystemWatcher;

suite("CoverageService Tests", function() {
    teardown(function() {
        (workspace as any).createFileSystemWatcher = createFileSystemWatcher;
    });

    test("Should listen for all paths specified in manualCoverageFilePaths @unit", function() {
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
            return mockFileWatcher;
        };
        (service as any).listenToFileSystem();

        assert.equal(globPassed, "{/path1,/path2}");
    });

    test("Should listen for coverage file names in workspace @unit", function() {
        const config: any = {
            coverageBaseDir: "custom/path/*",
            coverageFileNames: [
                "coverage.xml",
                "custom-lcov.info",
            ],
            manualCoverageFilePaths: [],
        };
        const service = new CoverageService(config, mockOutputChannel);

        let globPassed;
        (workspace as any).createFileSystemWatcher = (glob) => {
            globPassed = glob;
            return mockFileWatcher;
        };
        (service as any).listenToFileSystem();

        let prefix = config.coverageBaseDir;
        if (workspace.workspaceFolders) {
            const workspaceFolders = workspace.workspaceFolders.map((wf) => wf.uri.fsPath);
            prefix = `{${workspaceFolders}}/${prefix}`;
        }
        assert.equal(globPassed, `${prefix}/{coverage.xml,custom-lcov.info}`);
    });
});
