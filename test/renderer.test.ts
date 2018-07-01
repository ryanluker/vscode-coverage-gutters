import * as assert from "assert";
import {Renderer} from "../src/renderer";

suite("Renderer Tests", function() {
    const fakeConfig = {
        altSfCompare: false,
        fullCoverageDecorationType: {
            key: "testKey",
            dispose() {},
        },
        lcovFileName: "test.ts",
        noCoverageDecorationType: {
            key: "testKey4",
            dispose() {},
        },
        partialCoverageDecorationType: {
            key: "testKey3",
            dispose() {},
        },
        showStatusBarToggler: true,
        xmlFileName: "test.xml",
    };

    const fakeOutput = {
        append: () => {},
        appendLine: () => {},
        clear: () => {},
        dispose: () => {},
        hide: () => {},
        name: "fake",
        show: () => {},
    };

    const fakeReporter = {
        sendEvent: () => {},
    };

    test("Constructor should setup properly @unit", function(done) {
        assert.doesNotThrow(() => new Renderer(fakeConfig, fakeOutput, fakeReporter as any));
        return done();
    });
});
