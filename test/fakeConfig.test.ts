import { IConfigStore } from "../src/extension/config";

export const fakeConfig: IConfigStore = {
    altSfCompare: false,
    fullCoverageDecorationType: {
        key: "testKey",
        dispose() { },
    },
    ignoredPathGlobs: ["test/*"],
    lcovFileName: "test.ts",
    noCoverageDecorationType: {
        key: "testKey4",
        dispose() { },
    },
    partialCoverageDecorationType: {
        key: "testKey3",
        dispose() { },
    },
    showStatusBarToggler: true,
    xmlFileName: "test.xml",
};
