import { expect } from "chai";
import * as vscode from "vscode";

import {Config} from "../../src/extension/config";

// Original functions
const createTextEditorDecorationType = vscode.window.createTextEditorDecorationType;
const executeCommand = vscode.commands.executeCommand;
const getConfiguration = vscode.workspace.getConfiguration;

let showGutterCoverage: boolean;
let iconPathDark: string;
let iconPathLight: string;

suite("Config Tests", function() {
    const fakeVscode: any = {
        createTextEditorDecorationType: (options) => {
            expect(Object.keys(options)).to.have.lengthOf(4);
            return {};
        },

        executeCommand: () => {
            return ;
        },

        getConfiguration: () => {
            return {
                coverageFileNames: ["test.xml", "lcov.info"],
                get: (key) => {
                    if (key === "coverageFileNames") {
                        return ["test.xml", "lcov.info"];
                    } else if (key === "lcovname") {
                        return "lcov.info";
                    } else if (key === "showGutterCoverage") {
                        return showGutterCoverage;
                    } else if (key.includes("IconPathDark")) {
                        return iconPathDark;
                    } else if (key.includes("IconPathLight")) {
                        return iconPathLight;
                    }
                    return "123";
                },
                lcovname: "lcov.info",
                test1: "test1",
                test2: "test2",
                test3: "test3",
                xmlname: "name.xml",
            };
        },
    };

    const fakeContext: any = {
        asAbsolutePath: () => {
            return "123";
        },
    };

    teardown(function() {
        (vscode as any).window.createTextEditorDecorationType = createTextEditorDecorationType;
        (vscode as any).commands.executeCommand = executeCommand;
        (vscode as any).workspace.getConfiguration = getConfiguration;
    });

    setup(function() {
        (vscode as any).window.createTextEditorDecorationType = fakeVscode.createTextEditorDecorationType;
        (vscode as any).commands.executeCommand = fakeVscode.executeCommand;
        (vscode as any).workspace.getConfiguration = fakeVscode.getConfiguration;
    });

    test("Constructor should setup properly @unit", function() {
        expect(() => {
            new Config(fakeContext); // tslint:disable-line
        }).not.to.throw();
    });

    test("Can get configStore after initialization @unit", function() {
        const config = new Config(fakeContext);
        expect(config.coverageFileNames).not.to.equal(null);
    });

    test("Can get coverage file names @unit", function() {
        const config = new Config(fakeContext);
        // Check that unique file names is being applied
        expect(config.coverageFileNames).to.have.lengthOf(3);
    });

    test("Should remove gutter icons if showGutterCoverage is set to false, allows breakpoint usage @unit", function() {
        showGutterCoverage = false;
        (vscode as any).window.createTextEditorDecorationType = (options) => {
            expect(options.dark).to.not.have.any.keys("gutterIconPath");
            expect(options.light).to.not.have.any.keys("gutterIconPath");
        };
        new Config(fakeContext); // tslint:disable-line
    });

    test("Should set the gutter icon to the provided value if set @unit", function() {
        showGutterCoverage = true;
        iconPathDark = "/my/absolute/path/to/custom/icon-dark.svg";
        iconPathLight = "";
        (vscode as any).window.createTextEditorDecorationType = (options) => {
            expect(options.dark.gutterIconPath).to.equal(iconPathDark);
            expect(options.light.gutterIconPath).to.include("./app_images/");
        };
        fakeContext.asAbsolutePath = (options) => options;
        new Config(fakeContext); // tslint:disable-line
    });

});
