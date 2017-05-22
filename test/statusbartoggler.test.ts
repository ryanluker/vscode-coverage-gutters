import * as assert from "assert";
import * as vscode from "vscode";
import {IConfigStore} from "../src/config";
import {StatusBarToggler} from "../src/statusbartoggler";

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
    };

    test("Should toggle showStatusBarToggler command and message", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle();
    });

    test("Should dispose when asked", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.dispose();
    });
});
