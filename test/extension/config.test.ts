import { expect } from "chai";
import sinon from "sinon";
import * as vscode from "vscode";

import { Config } from "../../src/extension/config";

let showGutterCoverage: boolean;
let iconPathDark: string;
let iconPathLight: string;

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
                    } else if (key.includes("IconPathDark")) {
                        return iconPathDark;
                    } else if (key.includes("IconPathLight")) {
                        return iconPathLight;
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

    test("Should set the gutter icon to the provided value if set @unit", () => {
        showGutterCoverage = true;
        iconPathDark = "/my/absolute/path/to/custom/icon-dark.svg";
        iconPathLight = "";
        stubCreateTextEditorDecorationType.callsFake((options) => {
            expect((options.dark as any).gutterIconPath).to.equal(iconPathDark);
            expect((options.light as any).gutterIconPath).to.include("./app_images/");
            return {} as vscode.TextEditorDecorationType;
        });

        fakeContext.asAbsolutePath = (options: any) => options;
        new Config(fakeContext);
    });
});
