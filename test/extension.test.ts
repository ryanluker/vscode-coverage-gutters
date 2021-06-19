import * as assert from "assert";
import { exec } from "child_process";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ICoverageLines } from "../src/coverage-system/renderer";
import { StatusBarToggler } from "../src/extension/statusbartoggler";

suite("Extension Tests", function() {
    this.timeout(25000);

    test("Preview the coverage report in a new webview tab @integration", async () => {
        // Note: depends on "coverage-gutters.coverageReportFileName": "index.html",
        // being set in the example.code-workspace setting file as the coverage report
        // is in the root of the node folder and not inside the default /coverage
        await waitForExtension(2000);

        await vscode.commands.executeCommand("coverage-gutters.previewCoverageReport");
        // Look to see if the webview is open and showing preview coverage
        await waitForExtension(2000);
        const reportView = vscode.workspace.textDocuments[0];
        assert.equal(reportView.languageId, "html");
    });

    test("Run display coverage on a test file that has coverages generated remotely @integration", async () => {
        await waitForExtension(2000);
        const extension = vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;

        const testCoverage = await vscode.workspace.findFiles("**/remote-test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(3, cachedLines.full.length);
            assert.equal(1, cachedLines.none.length);
            assert.equal(1, cachedLines.partial.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on node test file with large lcov.info file @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;

        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(14, cachedLines.full.length);
            assert.equal(4, cachedLines.none.length);
            assert.equal(7, cachedLines.partial.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on python test file @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const testCoverage = await vscode.workspace.findFiles("**/bar/a.py", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(3, cachedLines.full.length);
            assert.equal(3, cachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on php test file number 1 @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const testCoverage = await vscode.workspace.findFiles("**/main.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(4, cachedLines.full.length);
            assert.equal(2, cachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on php test file number 2 @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const testCoverage = await vscode.workspace.findFiles("**/main2.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(2, cachedLines.full.length);
            assert.equal(6, cachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on php test file number 3 @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const testCoverage = await vscode.workspace.findFiles("**/main3.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(3, cachedLines.full.length);
            assert.equal(1, cachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on java test file @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
        const testCoverage = await vscode.workspace.findFiles("**/mycompany/app/App.java", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(4, cachedLines.full.length);
            assert.equal(3, cachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run display coverage on node test file with large code base @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;
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
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const cachedLines: ICoverageLines = getCachedLines();
            assert.equal(14, cachedLines.full.length);
            assert.equal(4, cachedLines.none.length);
            assert.equal(7, cachedLines.partial.length);
        });

        extension.exports.emptyLastCoverage();
    });

    test("Run watch and open files to see coverage @integration", async () => {
        await waitForExtension(2000);
        const extension = await vscode.extensions.getExtension("ryanluker.vscode-coverage-gutters");
        if (!extension) {
            throw new Error("Could not load extension");
        }
        const getCachedLines = extension.exports.getLastCoverageLines;

        // Look at javascript file and assert coverage
        await vscode.commands.executeCommand("coverage-gutters.watchCoverageAndVisibleEditors");
        const testJSCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testJSDocument = await vscode.workspace.openTextDocument(testJSCoverage[0]);
        await vscode.window.showTextDocument(testJSDocument);

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const jsCachedLines: ICoverageLines = getCachedLines();
            assert.equal(14, jsCachedLines.full.length);
            assert.equal(4, jsCachedLines.none.length);
            assert.equal(7, jsCachedLines.partial.length);
        });

        extension.exports.emptyLastCoverage();

        // Look at java file and assert coverage
        const testJavaCoverage = await vscode.workspace.findFiles("**/mycompany/app/App.java", "**/node_modules/**");
        const testJavaDocument = await vscode.workspace.openTextDocument(testJavaCoverage[0]);
        await vscode.window.showTextDocument(testJavaDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");
        await waitForExtension(2000);

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const javaCachedLines: ICoverageLines = getCachedLines();
            assert.equal(4, javaCachedLines.full.length);
            assert.equal(3, javaCachedLines.none.length);
        });

        extension.exports.emptyLastCoverage();
        return vscode.commands.executeCommand("coverage-gutters.removeWatch");
    });

    test(
        "Run coverage and open files to see line coverage percentage in the status bar @integration",
        async () => {
        await vscode.commands.executeCommand("workbench.action.closeAllEditors");
        const setCoverageSpy = sinon.spy(StatusBarToggler.prototype, "setCoverage");

        await vscode.commands.executeCommand("coverage-gutters.watchCoverageAndVisibleEditors");
        await waitForExtension(1000);

        const [testJSCoverage] = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testJSDocument = await vscode.workspace.openTextDocument(testJSCoverage);

        setCoverageSpy.resetHistory();
        await vscode.window.showTextDocument(testJSDocument, vscode.ViewColumn.One);

        assert.strictEqual(setCoverageSpy.calledWith(84), true);
        setCoverageSpy.resetHistory();

        const [testJavaCoverage] = await vscode.workspace.findFiles("**/App.java", "**/node_modules/**");
        const testJavaDocument = await vscode.workspace.openTextDocument(testJavaCoverage);

        await vscode.window.showTextDocument(testJavaDocument,  vscode.ViewColumn.Two);

        assert.strictEqual(setCoverageSpy.calledWith(57), true);
        setCoverageSpy.resetHistory();

        await vscode.commands.executeCommand("workbench.action.previousEditor");

        assert.strictEqual(setCoverageSpy.calledWith(84), true);
        setCoverageSpy.resetHistory();

        await vscode.commands.executeCommand("workbench.action.closeAllEditors");

        assert.strictEqual(setCoverageSpy.calledWith(undefined), true);

        setCoverageSpy.restore();
        return vscode.commands.executeCommand("coverage-gutters.removeWatch");
    });
});

async function waitForExtension(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkCoverage(checkFunc: () => void) {
    let tries = 0;
    return new Promise<void>((resolve) => {
        function checker() {
            if (tries > 5) {
                throw new Error("No coverage match after 5 tries!");
            }
            try {
                checkFunc();
                return resolve();
            } catch (error) {
                tries++;
                setTimeout(checker, 1000);
            }
        }
        // Start the coverage checker
        checker();
    });
}
