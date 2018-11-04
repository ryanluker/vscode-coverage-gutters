import * as assert from "assert";
import { exec } from "child_process";
import * as vscode from "vscode";
import {ICoverageLines} from "../src/coverage-system/renderer";

suite("Extension Tests", function() {
    this.timeout(25000);

    test("Run display coverage on node test file @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(14, cachedLines.full.length);
        assert.equal(4, cachedLines.none.length);
        assert.equal(7, cachedLines.partial.length);
        emptyLines();
    });

    test("Run display coverage on node test file with large code base @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);

        // Generate more files to test for large code bases #182
        await exec("cp -r node node2");
        await exec("cp -r node node3");
        await exec("cp -r node node4");
        await exec("cp -r node node5");
        await exec("cp -r node node6");
        await exec("cp -r node node7");

        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(14, cachedLines.full.length);
        assert.equal(4, cachedLines.none.length);
        assert.equal(7, cachedLines.partial.length);
        emptyLines();
    });

    test("Run display coverage on python test file @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/bar/a.py", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(3, cachedLines.full.length);
        assert.equal(3, cachedLines.none.length);
        emptyLines();
    });

    test("Run display coverage on php test file number 1 @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/main.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(4, cachedLines.full.length);
        assert.equal(2, cachedLines.none.length);
        emptyLines();
    });

    test("Run display coverage on php test file number 2 @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/main2.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(2, cachedLines.full.length);
        assert.equal(6, cachedLines.none.length);
        emptyLines();
    });

    test("Run display coverage on java test file @integration", async () => {
        // Wait for extension to load
        await sleep(2000);

        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const emptyLines = extension.exports.emptyLastCoverage;
        const testCoverage = await vscode.workspace.findFiles("**/mycompany/app/App.java", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("extension.displayCoverage");

        // Wait for decorations to load
        await sleep(2000);

        // Look for exact coverage on the file
        const cachedLines: ICoverageLines = getCachedLines();
        assert.equal(4, cachedLines.full.length);
        assert.equal(3, cachedLines.none.length);
        emptyLines();
    });
});

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
