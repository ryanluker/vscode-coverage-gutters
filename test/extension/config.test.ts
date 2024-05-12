import { expect } from "chai";
import sinon from "sinon";
import * as vscode from "vscode";

import { Config } from "../../src/extension/config";

let showGutterCoverage: boolean;
let highlightdark: string;
let highlightlight: string;


suite("Config Tests", () => {
    const fakeContext: any = {
        asAbsolutePath: () => {
            return "123";
        },
    };

    let stubCreateTextEditorDecorationType: sinon.SinonStub;
    const fakeCreateTextEditorDecorationType = (options: vscode.DecorationRenderOptions) => {
        expect(Object.keys(options)).to.have.lengthOf(4);
        return {} as vscode.TextEditorDecorationType;
    };

    setup(() => {
        stubCreateTextEditorDecorationType = sinon.stub(vscode.window, "createTextEditorDecorationType");

        sinon.stub(vscode.commands, "executeCommand").callsFake(async () => undefined);

        sinon.stub(vscode.workspace, "getConfiguration").callsFake(() => {
            return {
                coverageFileNames: ["test.xml", "lcov.info"],
                get: (key: any) => {
                    if (key === "coverageFileNames") {
                        return ["test.xml", "lcov.info"];
                    } else if (key === "showGutterCoverage") {
                        return showGutterCoverage;
                    } else if (["highlightdark", "partialHighlightDark", "noHighlightDark"].includes(key)) {
                        return highlightdark;
                    } else if (["highlightlight", "partialHighlightLight", "noHighlightLight"].includes(key)) {
                        return highlightlight;
                    }
                    return "123";
                },
                test1: "test1",
                test2: "test2",
                test3: "test3",
            } as unknown as vscode.WorkspaceConfiguration;
        });
    });

    teardown(() => sinon.restore());

    test("Constructor should setup properly @unit", () => {
        stubCreateTextEditorDecorationType.callsFake(
            fakeCreateTextEditorDecorationType,
        );

        expect(() => {
            new Config(fakeContext);
        }).not.to.throw();
    });

    test("Can get configStore after initialization @unit", () => {
        stubCreateTextEditorDecorationType.callsFake(
            fakeCreateTextEditorDecorationType,
        );

        const config = new Config(fakeContext);
        expect(config.coverageFileNames).not.to.equal(null);
    });

    test("Can get coverage file names @unit", () => {
        stubCreateTextEditorDecorationType.callsFake(
            fakeCreateTextEditorDecorationType,
        );

        const config = new Config(fakeContext);
        // Check that unique file names is being applied
        expect(config.coverageFileNames).to.have.lengthOf(2);
    });

    test("Should remove gutter icons if showGutterCoverage is set to false, allows breakpoint usage @unit", () => {
        showGutterCoverage = false;

        stubCreateTextEditorDecorationType.callsFake((options) => {
            expect(options.dark).to.not.have.any.keys("gutterIconPath");
            expect(options.light).to.not.have.any.keys("gutterIconPath");
            return {} as vscode.TextEditorDecorationType;
        });

        new Config(fakeContext);
    });

    test("Should set the gutter icon colour to the provided value if set @unit", () => {
        showGutterCoverage = true;
        highlightdark = "rgb(255, 0, 0)";
        highlightlight = "rgb(0, 0, 255)";

        const preamble = /^image\/svg\+xml;base64,/;
        stubCreateTextEditorDecorationType.callsFake((options) => {
            expect(((options.dark as any).gutterIconPath as any).path).to.be.a('string').and.match(preamble).and.satisfy((icn: string) => atob(icn.replace(preamble, '')).includes(highlightdark));
            expect(((options.light as any).gutterIconPath as any).path).to.be.a('string').and.match(preamble).and.satisfy((icn: string) => atob(icn.replace(preamble, '')).includes(highlightlight));
            return {} as vscode.TextEditorDecorationType;
        });

        fakeContext.asAbsolutePath = (options: any) => options;
        new Config(fakeContext);
    });
});
