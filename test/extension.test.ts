'use strict';

import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", () => {
    test("Should activate on vscode open and produce error on sequential activates", () => {
        let ctx: vscode.ExtensionContext = <any>{
            subscriptions: []
        };

        try{
            myExtension.activate(ctx);
        } catch(e) {
            assert.equal("command with id already exists", e.message);
        }
    });
});