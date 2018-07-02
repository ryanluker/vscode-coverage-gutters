import * as assert from "assert";
import * as vscode from "vscode";
import {ICoverageLines} from "../src/renderer";

suite("Extension Tests", function() {
    this.timeout(25000);

    test("Run display coverage on node test file @integration", async () => {
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports;
        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        const testEditor = await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        // TODO: need a better way to do this...
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(14, cachedLines.full.length);
        assert.equal(4, cachedLines.none.length);
        assert.equal(7, cachedLines.partial.length);
    });

    test("Run display coverage on python test file @integration", async () => {
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports;
        const testCoverage = await vscode.workspace.findFiles("**/bar/a.py", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        const testEditor = await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        // TODO: need a better way to do this...
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(3, cachedLines.full.length);
        assert.equal(3, cachedLines.none.length);
    });
});

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
