import * as assert from "assert";
import * as vscode from "vscode";
import {activate} from "../src/extension";

suite("Extension Tests", function() {
    this.timeout(4000);

    test("Should open extension @integration", () => {
        const fakeContext: any = {
            asAbsolutePath: () => {
                return "123";
            },
            subscriptions: [],
        };
        activate(fakeContext);

        assert.equal(
            fakeContext.subscriptions.length,
            6,
            "Does not have the proper amount of functionality",
        );
    });
});
