import { expect } from "chai";
import sinon from "sinon";
import { FileSystemWatcher, OutputChannel, workspace } from "vscode";

import { CoverageService } from "../../src/coverage-system/coverageservice";
import { StatusBarToggler } from "../../src/extension/statusbartoggler";

const mockOutputChannel = {appendLine: (x) => {}} as OutputChannel;
const mockFileWatcher = {
    dispose: () => {},
    onDidChange: (fn: any) => {},
    onDidCreate: (fn: any) => {},
    onDidDelete: (fn: any) => {},
};
const mockStatusBarToggler = {setLoading: () => {}} as StatusBarToggler;

suite("CoverageService Tests", function() {
    teardown(() => sinon.restore());

    test("Should listen for all paths specified in manualCoverageFilePaths @unit", () => {
        const config: any = {
            manualCoverageFilePaths: [
                "/path1",
                "/path2",
            ],
        };
        const service = new CoverageService(config, mockOutputChannel, mockStatusBarToggler);

        const stubCreateFileSystemWatcher = sinon.stub(workspace, "createFileSystemWatcher")
            .returns(mockFileWatcher as FileSystemWatcher);

        (service as any).listenToFileSystem();

        expect(stubCreateFileSystemWatcher).to.be.calledWith("{/path1,/path2}");
    });

    test("Should listen for coverage file names in workspace @unit", () => {
        const config: any = {
            coverageBaseDir: "custom/path/*",
            coverageFileNames: [
                "coverage.xml",
                "custom-lcov.info",
            ],
            manualCoverageFilePaths: [],
        };
        const service = new CoverageService(config, mockOutputChannel, mockStatusBarToggler);

        const stubCreateFileSystemWatcher = sinon.stub(workspace, "createFileSystemWatcher")
            .returns(mockFileWatcher as FileSystemWatcher);

        (service as any).listenToFileSystem();

        let prefix = config.coverageBaseDir;
        if (workspace.workspaceFolders) {
            const workspaceFolders = workspace.workspaceFolders.map((wf) => wf.uri.fsPath);
            prefix = `{${workspaceFolders}}/${prefix}`;
        }
        expect(stubCreateFileSystemWatcher).to.be.calledWith(`${prefix}/{coverage.xml,custom-lcov.info}`);
    });
});
