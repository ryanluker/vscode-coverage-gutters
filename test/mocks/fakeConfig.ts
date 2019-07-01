export const fakeConfig: any = {
    coverageFileNames: ["test.ts", "test.xml"],
    fullCoverageDecorationType: {
        key: "testKey",
        dispose() { },
    },
    ignoredPathGlobs: "test/*",
    manualCoverageFilePaths: [],
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
