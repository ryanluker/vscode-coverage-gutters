import {ExtensionContext, TextEditorDecorationType} from "vscode";
import {InterfaceVscode} from "./wrappers/vscode";

export type ConfigStore = {
    lcovFileName: string;
    coverageDecorationType: TextEditorDecorationType;
    gutterDecorationType: TextEditorDecorationType;
    altSfCompare: boolean;
};

export class Config {
    private vscode: InterfaceVscode;
    private context: ExtensionContext;

    private lcovFileName: string;
    private coverageDecorationType: TextEditorDecorationType;
    private gutterDecorationType: TextEditorDecorationType;
    private altSfCompare: boolean;

    constructor(vscode: InterfaceVscode, context: ExtensionContext) {
        this.vscode = vscode;
        this.context = context;
    }

    public get(): ConfigStore {
        return {
            altSfCompare: this.altSfCompare,
            coverageDecorationType: this.coverageDecorationType,
            gutterDecorationType: this.gutterDecorationType,
            lcovFileName: this.lcovFileName,
        };
    }

    public setup(): ConfigStore {
        // Customizable UI configurations
        const rootCustomConfig = this.vscode.getConfiguration("coverage-gutters.customizable");
        const configsCustom = Object.keys(rootCustomConfig);
        for (let element of configsCustom) {
            this.vscode.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                rootCustomConfig.get(element));
        }

        // Basic configurations
        const rootConfig = this.vscode.getConfiguration("coverage-gutters");
        this.lcovFileName = rootConfig.get("lcovname") as string;
        this.altSfCompare = rootConfig.get("altSfCompare") as boolean;

        const coverageLightBackgroundColour = rootConfig.get("highlightlight") as string;
        const coverageDarkBackgroundColour = rootConfig.get("highlightdark") as string;
        const gutterIconPathDark = rootConfig.get("gutterIconPathDark") as string;
        const gutterIconPathLight = rootConfig.get("gutterIconPathLight") as string;

        this.coverageDecorationType = this.vscode.createTextEditorDecorationType({
            dark: {
                backgroundColor: coverageDarkBackgroundColour,
            },
            isWholeLine: true,
            light: {
                backgroundColor: coverageLightBackgroundColour,
            },
        });

        this.gutterDecorationType = this.vscode.createTextEditorDecorationType({
            dark: {
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathDark),
            },
            light: {
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathLight),
            },
        });

        return this.get();
    }
}
