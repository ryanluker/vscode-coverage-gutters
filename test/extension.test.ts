'use strict';

import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", () => {
    test("Should activate and have subscriptions length of 3", () => {
        let ctx: vscode.ExtensionContext = <any>{
            subscriptions: []
        };
        myExtension.activate(ctx);
        assert.equal(ctx.subscriptions.length, 3);
    });
});