'use strict';
import {VscodeInterface} from "./wrappers/vscode";
import {TextEditorDecorationType, ExtensionContext} from "vscode";

export interface configStore {
    lcovFileName: string,
    coverageDecorationType: TextEditorDecorationType,
    gutterDecorationType: TextEditorDecorationType
}

export class Config {
    private vscode: VscodeInterface;
    private context: ExtensionContext;

    private lcovFileName: string;
    private coverageDecorationType: TextEditorDecorationType;
    private gutterDecorationType: TextEditorDecorationType;

    constructor(vscode: VscodeInterface, context: ExtensionContext) {
        this.vscode = vscode;
        this.context = context;
    }

    public get(): configStore {
        return {
            lcovFileName: this.lcovFileName,
            coverageDecorationType: this.coverageDecorationType,
            gutterDecorationType: this.gutterDecorationType
        }
    }

    public setup(): configStore {
        //Customizable UI configurations
        const rootCustomConfig = this.vscode.getConfiguration("coverage-gutters.customizable");
        const configsCustom = Object.keys(rootCustomConfig);
        for(let element of configsCustom) {
            this.vscode.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                rootCustomConfig.get(element));
        }

        //Basic configurations
        const rootConfig = this.vscode.getConfiguration("coverage-gutters");
        this.lcovFileName = rootConfig.get("lcovname") as string;
        const coverageLightBackgroundColour = rootConfig.get("highlightlight") as string;
        const coverageDarkBackgroundColour = rootConfig.get("highlightdark") as string;
        const gutterIconPathDark = rootConfig.get("gutterIconPathDark") as string;
        const gutterIconPathLight = rootConfig.get("gutterIconPathLight") as string;

        this.coverageDecorationType = this.vscode.createTextEditorDecorationType({
            isWholeLine: true,
            light: {
                backgroundColor: coverageLightBackgroundColour
            },
            dark: {
                backgroundColor: coverageDarkBackgroundColour
            }
        });

        this.gutterDecorationType = this.vscode.createTextEditorDecorationType({
            light: {
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathLight)
            },
            dark: {
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathDark)
            }
        });

        return this.get();
    }
}