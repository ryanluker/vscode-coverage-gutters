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

    test("Run display coverage on node test file @integration", async () => {
        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        const testEditor = await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(1000);
        return;
    });
});

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
