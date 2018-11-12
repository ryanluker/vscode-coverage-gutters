import { IConfigStore } from "../../src/extension/config";

export const fakeConfig: IConfigStore = {
    coverageFileNames: ["test.ts", "test.xml"],
    fullCoverageDecorationType: {
        key: "testKey",
        dispose() { },
    },
    ignoredPathGlobs: "test/*",
    noCoverageDecorationType: {
        key: "testKey4",
        dispose() { },
    },
    partialCoverageDecorationType: {
        key: "testKey3",
        dispose() { },
    },
    showStatusBarToggler: true,
};
