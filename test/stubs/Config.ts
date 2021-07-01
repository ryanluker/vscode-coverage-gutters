import sinon from "sinon";
import { Config } from "../../src/extension/config";

const stubConfig: Config = sinon.stub(Config) as any;
stubConfig.coverageFileNames = ["test.ts", "test.xml"];
stubConfig.fullCoverageDecorationType = {
    key: "testKey",
    dispose() { },
};
stubConfig.noCoverageDecorationType = {
    key: "testKey4",
    dispose() { },
};
stubConfig.partialCoverageDecorationType = {
    key: "testKey3",
    dispose() { },
};
stubConfig.ignoredPathGlobs = "test/*";
stubConfig.manualCoverageFilePaths = [];
stubConfig.showStatusBarToggler = true;

export default stubConfig;
