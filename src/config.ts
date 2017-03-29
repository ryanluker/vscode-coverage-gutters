import {ExtensionContext, OverviewRulerLane, TextEditorDecorationType} from "vscode";
import {InterfaceVscode} from "./wrappers/vscode";

export type ConfigStore = {
    lcovFileName: string;
    fullCoverageDecorationType: TextEditorDecorationType;
    partialCoverageDecorationType: TextEditorDecorationType;
    noCoverageDecorationType: TextEditorDecorationType;
    altSfCompare: boolean;
};

export interface InterfaceConfig {
    get(): ConfigStore;
    setup(): ConfigStore;
}

export class Config {
    private vscode: InterfaceVscode;
    private context: ExtensionContext;

    private lcovFileName: string;
    private fullCoverageDecorationType: TextEditorDecorationType;
    private partialCoverageDecorationType: TextEditorDecorationType;
    private noCoverageDecorationType: TextEditorDecorationType;
    private altSfCompare: boolean;

    constructor(vscode: InterfaceVscode, context: ExtensionContext) {
        this.vscode = vscode;
        this.context = context;
    }

    public get(): ConfigStore {
        return {
            altSfCompare: this.altSfCompare,
            fullCoverageDecorationType: this.fullCoverageDecorationType,
            lcovFileName: this.lcovFileName,
            noCoverageDecorationType: this.noCoverageDecorationType,
            partialCoverageDecorationType: this.partialCoverageDecorationType,
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

        // Themes and icons
        const coverageLightBackgroundColour = rootConfig.get("highlightlight") as string;
        const coverageDarkBackgroundColour = rootConfig.get("highlightdark") as string;
        const partialCoverageLightBackgroundColour = rootConfig.get("partialHighlightLight") as string;
        const partialCoverageDarkBackgroundColour = rootConfig.get("partialHighlightDark") as string;
        const noCoverageLightBackgroundColour = rootConfig.get("noHighlightLight") as string;
        const noCoverageDarkBackgroundColour = rootConfig.get("noHighlightDark") as string;
        const gutterIconPathDark = rootConfig.get("gutterIconPathDark") as string;
        const gutterIconPathLight = rootConfig.get("gutterIconPathLight") as string;
        const partialGutterIconPathDark = rootConfig.get("partialGutterIconPathDark") as string;
        const partialGutterIconPathLight = rootConfig.get("partialGutterIconPathLight") as string;
        const noGutterIconPathDark = rootConfig.get("noGutterIconPathDark") as string;
        const noGutterIconPathLight = rootConfig.get("noGutterIconPathLight") as string;

        this.fullCoverageDecorationType = this.vscode.createTextEditorDecorationType({
            dark: {
                backgroundColor: coverageDarkBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathDark),
                overviewRulerColor: coverageDarkBackgroundColour,
            },
            isWholeLine: true,
            light: {
                backgroundColor: coverageLightBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(gutterIconPathLight),
                overviewRulerColor: coverageLightBackgroundColour,
            },
            overviewRulerLane: OverviewRulerLane.Full,
        });

        this.partialCoverageDecorationType = this.vscode.createTextEditorDecorationType({
            dark: {
                backgroundColor: partialCoverageDarkBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(partialGutterIconPathDark),
                overviewRulerColor: partialCoverageDarkBackgroundColour,
            },
            isWholeLine: true,
            light: {
                backgroundColor: partialCoverageLightBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(partialGutterIconPathLight),
                overviewRulerColor: partialCoverageLightBackgroundColour,
            },
            overviewRulerLane: OverviewRulerLane.Full,
        });

        this.noCoverageDecorationType = this.vscode.createTextEditorDecorationType({
            dark: {
                backgroundColor: noCoverageDarkBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(noGutterIconPathDark),
                overviewRulerColor: noCoverageDarkBackgroundColour,
            },
            isWholeLine: true,
            light: {
                backgroundColor: noCoverageLightBackgroundColour,
                gutterIconPath: this.context.asAbsolutePath(noGutterIconPathLight),
                overviewRulerColor: noCoverageLightBackgroundColour,
            },
            overviewRulerLane: OverviewRulerLane.Full,
        });

        return this.get();
    }
}
