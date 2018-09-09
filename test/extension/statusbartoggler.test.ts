import * as assert from "assert";
import * as vscode from "vscode";
import {IConfigStore} from "../../src/extension/config";
import {StatusBarToggler} from "../../src/extension/statusbartoggler";

suite("Status Bar Toggler Tests", function() {
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
        showStatusBarToggler: false,
        xmlFileName: "test.xml",
    };

    test("Should toggle showStatusBarToggler command and message @unit", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle();
    });

    test("Should dispose when asked @unit", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.dispose();
    });
});
