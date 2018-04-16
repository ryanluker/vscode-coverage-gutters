import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Tests", function() {
    this.timeout(50000);

    test("Should start extension @integration", async () => {
        const started = vscode.extensions.getExtension(
            "ryanluker.vscode-coverage-gutters",
        ).isActive;
        assert.equal(started, true);
    });
});
