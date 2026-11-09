import { expect } from "chai";
import { exec } from "child_process";
import sinon from "sinon";
import { after, afterEach } from "mocha";
import * as vscode from "vscode";
import { ICoverageLines, Renderer } from "../src/coverage-system/renderer";
import { StatusBarToggler } from "../src/extension/statusbartoggler";
import { Gutters, PREVIEW_COMMAND } from "../src/extension/gutters";

suite("Extension Tests", function () {
    const disposables: vscode.Disposable[] = [];

    afterEach(() => {
        // Clear mocks after each test to avoid cascading failures due to one test failing
        sinon.restore();

        // Also clear any disposables
        disposables.forEach(d => d.dispose());
        disposables.length = 0;
    });

    after(() => {
        vscode.window.showInformationMessage('All tests done!');
    });

    test("Preview the coverage report without live server extension @integration", async function() {
        const getLiveServerStub = sinon.stub(Gutters.prototype, "getLiveServerExtension");
        getLiveServerStub.returns(undefined);

        const toastStub = sinon.stub(vscode.window, "showErrorMessage");

        await vscode.commands.executeCommand("coverage-gutters.previewCoverageReport");

        expect(toastStub.callCount).to.equal(1);
        const call = toastStub.getCall(0);
        expect(call.args[0]).to.equal("Live Preview extension not installed");
    });

    test("Preview the coverage report with live server installed but inactive @integration", async function() {
        const getLiveServerStub = sinon.stub(Gutters.prototype, "getLiveServerExtension");
        const liveServer = { isActive: false, activate: () => { liveServer.isActive = true; } };
        getLiveServerStub.returns(liveServer as never);

        const doPreviewStub = sinon.stub();
        disposables.push(vscode.commands.registerCommand(PREVIEW_COMMAND, doPreviewStub));

        // Note: depends on "coverage-gutters.coverageReportFileName": "index.html",
        // being set in the example.code-workspace setting file as the coverage report
        // is in the root of the node folder and not inside the default /coverage
        await vscode.commands.executeCommand("coverage-gutters.previewCoverageReport");
        expect(liveServer.isActive).to.equal(true);
        expect(doPreviewStub.callCount).to.equal(1);
    });

    test("Preview the coverage report with live server @integration", async function() {
        const getLiveServerStub = sinon.stub(Gutters.prototype, "getLiveServerExtension");
        getLiveServerStub.returns({ isActive: true } as never);

        const doPreviewStub = sinon.stub();
        disposables.push(vscode.commands.registerCommand(PREVIEW_COMMAND, doPreviewStub));

        // Note: depends on "coverage-gutters.coverageReportFileName": "index.html",
        // being set in the example.code-workspace setting file as the coverage report
        // is in the root of the node folder and not inside the default /coverage
        await vscode.commands.executeCommand("coverage-gutters.previewCoverageReport");
        expect(doPreviewStub.callCount).to.equal(1);
    });

    test("Run display coverage on a test file that has coverages generated remotely @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/remote-test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(3);
                expect(cachedLines.none).to.have.lengthOf(1);
                expect(cachedLines.partial).to.have.lengthOf(1);
            }
        });
        decorationSpy.restore();
    });

    test("Run display coverage on node test file with large lcov.info file @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(14);
                expect(cachedLines.none).to.have.lengthOf(4);
                expect(cachedLines.partial).to.have.lengthOf(7);
            }
        });
        decorationSpy.restore();
    });

    test("Run display coverage on python test file @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/bar/a.py", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(3);
                expect(cachedLines.none).to.have.lengthOf(3);
            }
        });

        await vscode.commands.executeCommand("coverage-gutters.removeCoverage");
        decorationSpy.restore();
    });

    test("Run toggle coverage on python test file x2 @integration", async () => {
        // Set up the spies to allow for detecting proper code flows
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");
        const removalSpy = sinon.spy(Renderer.prototype, "removeDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/bar/a.py", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);

        // Toggle coverage on
        await vscode.commands.executeCommand("coverage-gutters.toggleCoverage");
        await checkCoverage(() => {
            if (decorationSpy.getCall(0)) {
                // Look for exact coverage on the file
                const cachedLines: ICoverageLines = decorationSpy.getCall(0).args[1];
                expect(cachedLines.full).to.have.lengthOf(3);
                expect(cachedLines.none).to.have.lengthOf(3);
            }
        });

        // Toggle coverage off
        await vscode.commands.executeCommand("coverage-gutters.toggleCoverage");
        // Check that renderSections was called with empty Map
        await checkCoverage(() => {
            // Check for remove coverage being called twice
            const coverageRemovalCalls = removalSpy.getCalls();
            if (coverageRemovalCalls) return;

            expect(coverageRemovalCalls).to.have.length(2);
            // Check for the coverage display being called once
            const coverageAdditionCalls = decorationSpy.getCalls();
            if (coverageAdditionCalls) return;

            expect(coverageAdditionCalls).to.have.length(1);
        });

        decorationSpy.restore();
        removalSpy.restore();
    });

    test("Run display coverage on php test file number 1 @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/main.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(4);
                expect(cachedLines.none).to.have.lengthOf(2);
            }
        });

        decorationSpy.restore();
    });

    test("Run display coverage on php test file number 2 @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/main2.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.none).to.have.lengthOf(6);
                expect(cachedLines.full).to.have.lengthOf(2);
            }
        });

        decorationSpy.restore();
    });

    test("Run display coverage on php test file number 3 @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/main3.php", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(3);
                expect(cachedLines.none).to.have.lengthOf(1);
            }
        });

        decorationSpy.restore();
    });

    test("Run display coverage on java test file @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/mycompany/app/App.java", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(4);
                expect(cachedLines.none).to.have.lengthOf(3);
            }
        });

        decorationSpy.restore();
    });

    test("Run display coverage on java files from jacoco-aggregate report @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const modules = [
            {
                id: 1,
                linesCovered: 12,
                linesNotCovered: 0,
            },
            {
                id: 2,
                linesCovered: 2,
                linesNotCovered: 1,
            },
        ];

        for (let i = 0; i < modules.length; i++) {
            const { id, linesCovered, linesNotCovered } = modules[i];
            const path = `**/praveen/samples/jacoco/multimodule/Module${id}Class.java`
            const testCoverage = await vscode.workspace.findFiles(path, "**/node_modules/**");
            const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
            await vscode.window.showTextDocument(testDocument);
            await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

            await checkCoverage(() => {
                // Look for exact coverage on the file
                const spyCall = decorationSpy.getCall(i);
                expect(spyCall).to.not.be.null;
                if (spyCall) {
                    const cachedLines: ICoverageLines = spyCall.args[1];
                    expect(cachedLines.full).to.have.lengthOf(linesCovered);
                    expect(cachedLines.none).to.have.lengthOf(linesNotCovered);
                }
            });
        }

        decorationSpy.restore();
    });

    test("Run display coverage on ruby test file @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        const testCoverage = await vscode.workspace.findFiles("**/ruby/lib/app/math.rb", "**/node_modules/**");
        const testDocument = await vscode.workspace.openTextDocument(testCoverage[0]);
        await vscode.window.showTextDocument(testDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");

        await checkCoverage(() => {
            // Look for exact coverage on the ruby file
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(4);
                expect(cachedLines.partial).to.have.lengthOf(1);
                expect(cachedLines.none).to.have.lengthOf(1);
            }
        });

        decorationSpy.restore();
    });

    test("Run display coverage on node test file with large code base @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

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
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                const cachedLines: ICoverageLines = spyCall.args[1];
                expect(cachedLines.full).to.have.lengthOf(14);
                expect(cachedLines.none).to.have.lengthOf(4);
                expect(cachedLines.partial).to.have.lengthOf(7);
            }
        });

        decorationSpy.restore();
    });

    test("Run watch and open files to see coverage @integration", async () => {
        const decorationSpy = sinon.spy(Renderer.prototype, "setDecorationsForEditor");

        // Look at javascript file and assert coverage
        await vscode.commands.executeCommand("coverage-gutters.watchCoverageAndVisibleEditors");
        const testJSCoverage = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
        const testJSDocument = await vscode.workspace.openTextDocument(testJSCoverage[0]);
        await vscode.window.showTextDocument(testJSDocument);

        await checkCoverage(() => {
            const spyCall = decorationSpy.getCall(0);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                // Look for exact coverage on the file
                const jsCachedLines: ICoverageLines = spyCall.args[1];
                expect(jsCachedLines.full).to.have.lengthOf(14);
                expect(jsCachedLines.none).to.have.lengthOf(4);
                expect(jsCachedLines.partial).to.have.lengthOf(7);
            }
        });

        // Look at java file and assert coverage
        const testJavaCoverage = await vscode.workspace.findFiles("**/mycompany/app/App.java", "**/node_modules/**");
        const testJavaDocument = await vscode.workspace.openTextDocument(testJavaCoverage[0]);
        await vscode.window.showTextDocument(testJavaDocument);
        await vscode.commands.executeCommand("coverage-gutters.displayCoverage");
        await wait(500);

        await checkCoverage(() => {
            const spyCall = decorationSpy.getCall(1);
            expect(spyCall).to.not.be.null;
            if (spyCall) {
                // Look for exact coverage on the file
                const javaCachedLines: ICoverageLines = spyCall.args[1];
                expect(javaCachedLines.full).to.have.lengthOf(4);
                expect(javaCachedLines.none).to.have.lengthOf(3);
            }
        });

        decorationSpy.restore();
        return vscode.commands.executeCommand("coverage-gutters.removeWatch");
    });

    test(
        "Run coverage and open files to see line coverage percentage in the status bar @integration",
        async () => {
            await vscode.commands.executeCommand("workbench.action.closeAllEditors");
            const setCoverageSpy = sinon.spy(StatusBarToggler.prototype, "setCoverage");

            await vscode.commands.executeCommand("coverage-gutters.watchCoverageAndVisibleEditors");
            await wait(500);

            const [testJSCoverage] = await vscode.workspace.findFiles("**/test-coverage.js", "**/node_modules/**");
            const testJSDocument = await vscode.workspace.openTextDocument(testJSCoverage);

            setCoverageSpy.resetHistory();
            await vscode.window.showTextDocument(testJSDocument, vscode.ViewColumn.One);

            expect(setCoverageSpy.calledWith(84)).to.be.true;
            setCoverageSpy.resetHistory();

            const [testJavaCoverage] = await vscode.workspace.findFiles("**/App.java", "**/node_modules/**");
            const testJavaDocument = await vscode.workspace.openTextDocument(testJavaCoverage);

            await vscode.window.showTextDocument(testJavaDocument, vscode.ViewColumn.Two, false);

            expect(setCoverageSpy.calledWith(57)).to.be.true;
            setCoverageSpy.resetHistory();

            await vscode.commands.executeCommand("workbench.action.previousEditor");

            expect(setCoverageSpy.calledWith(84)).to.be.true;
            setCoverageSpy.resetHistory();

            await vscode.commands.executeCommand("workbench.action.closeAllEditors");

            expect(setCoverageSpy.calledWith(undefined)).to.be.true;

            setCoverageSpy.restore();
            return vscode.commands.executeCommand("coverage-gutters.removeWatch");
        });
});

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkCoverage(checkFunc: () => void) {
    let tries = 0;
    return new Promise<void>((resolve, reject) => {
        function checker() {
            if (tries > 5) {
                return reject(Error("No coverage match after 5 tries!"));
            }
            try {
                checkFunc();
                return resolve();
            } catch (error) {
                console.error(error);
                tries++;
                setTimeout(checker, 1000);
            }
        }
        // Start the coverage checker
        checker();
    });
}
