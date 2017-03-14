'use strict';

import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", () => {
    test("Should activate on vscode open", () => {
        assert.equal(vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters").isActive, true);
    });
});