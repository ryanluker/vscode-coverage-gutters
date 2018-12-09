import * as assert from "assert";
import {Config} from "../../src/extension/config";

suite.skip("Config Tests", function() {
    const fakeVscode: any = {
        createTextEditorDecorationType: (options) => {
            assert.equal(Object.keys(options).length, 4);
            return {};
        },

        executeCommand: () => {
            return ;
        },

        getConfiguration: () => {
            return {
                coverageFileNames: ["test.xml", "lcov.info"],
                get: (key) => {
                    if (key === "coverageFileNames") {
                        return ["test.xml", "lcov.info"];
                    } else if (key === "lcovname") {
                        return "lcov.info";
                    }
                    return "123";
                },
                lcovname: "lcov.info",
                test1: "test1",
                test2: "test2",
                test3: "test3",
                xmlname: "name.xml",
            };
        },
    };

    const fakeContext: any = {
        asAbsolutePath: () => {
            return "123";
        },
    };

    const fakeReport: any = {
        sendEvent: () => {
            return ;
        },
    };

    test("Constructor should setup properly @unit", function() {
        assert.doesNotThrow(() => {
            const _CONFIG = new Config(fakeContext, fakeReport);
        });
    });

    test("Can get configStore after initialization @unit", function() {
        const config = new Config(fakeContext, fakeReport);
        const store = config.get();
        assert.notEqual(store.coverageFileNames, null);
    });

    test("Can get coverage file names @unit", function() {
        const config = new Config(fakeContext, fakeReport);
        const store = config.get();
        // Check that unique file names is being applied
        assert.equal(store.coverageFileNames.length, 3);
    });

    test("Should remove gutter icons if path is blank, allows breakpoint usage @unit", function() {
        fakeVscode.createTextEditorDecorationType = (options) => {
            assert.equal("gutterIconPath" in options.dark, false);
            assert.equal("gutterIconPath" in options.light, false);
        };
        fakeContext.asAbsolutePath = (options) => "";
        const config = new Config(fakeContext, fakeReport);
    });
});
