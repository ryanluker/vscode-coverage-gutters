'use strict';

import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", () => {
    test("Should not error when calling deactivate", () => {
        myExtension.deactivate();
    });
});