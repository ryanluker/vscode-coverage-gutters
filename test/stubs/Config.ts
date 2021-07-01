import sinon from "sinon";
import { Config } from "../../src/extension/config";

const stubConfig: Config = sinon.stub(Config) as any;
stubConfig.manualCoverageFilePaths = [];

export default stubConfig;
