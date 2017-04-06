import {
    DecorationRenderOptions,
    ExtensionContext,
    OverviewRulerLane,
    TextEditorDecorationType,
} from "vscode";
import {InterfaceVscode} from "./wrappers/vscode";

export interface ConfigStore {
    lcovFileName: string;
    fullCoverageDecorationType: TextEditorDecorationType;
    partialCoverageDecorationType: TextEditorDecorationType;
    noCoverageDecorationType: TextEditorDecorationType;
    altSfCompare: boolean;
};

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
        for (const element of configsCustom) {
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
        const showGutterCoverage = rootConfig.get("showGutterCoverage") as string;
        const showLineCoverage = rootConfig.get("showLineCoverage") as string;
        const showRulerCoverage = rootConfig.get("showRulerCoverage") as string;

        const fullDecoration: DecorationRenderOptions = {
            dark: {
                backgroundColor: showLineCoverage ? coverageDarkBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(gutterIconPathDark) : "",
                overviewRulerColor: showRulerCoverage ? coverageDarkBackgroundColour : "",
            },
            isWholeLine: true,
            light: {
                backgroundColor: showLineCoverage ? coverageLightBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(gutterIconPathLight) : "",
                overviewRulerColor: showRulerCoverage ? coverageLightBackgroundColour : "",
            },
            overviewRulerLane: OverviewRulerLane.Full,
        };

        this.fullCoverageDecorationType = this.vscode.createTextEditorDecorationType(fullDecoration);

        const partialDecoration: DecorationRenderOptions = {
            dark: {
                backgroundColor: showLineCoverage ? partialCoverageDarkBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(partialGutterIconPathDark) : "",
                overviewRulerColor: showRulerCoverage ? partialCoverageDarkBackgroundColour : "",
            },
            isWholeLine: true,
            light: {
                backgroundColor: showLineCoverage ? partialCoverageLightBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(partialGutterIconPathLight) : "",
                overviewRulerColor: showRulerCoverage ? partialCoverageLightBackgroundColour : "",
            },
            overviewRulerLane: OverviewRulerLane.Full,
        };

        this.partialCoverageDecorationType = this.vscode.createTextEditorDecorationType(partialDecoration);

        const noDecoration: DecorationRenderOptions = {
            dark: {
                backgroundColor: showLineCoverage ? noCoverageDarkBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(noGutterIconPathDark) : "",
                overviewRulerColor: showRulerCoverage ? noCoverageDarkBackgroundColour : "",
            },
            isWholeLine: true,
            light: {
                backgroundColor: showLineCoverage ? noCoverageLightBackgroundColour : "",
                gutterIconPath: showGutterCoverage ? this.context.asAbsolutePath(noGutterIconPathLight) : "",
                overviewRulerColor: showRulerCoverage ? noCoverageLightBackgroundColour : "",
            },
            overviewRulerLane: OverviewRulerLane.Full,
        };

        this.noCoverageDecorationType = this.vscode.createTextEditorDecorationType(noDecoration);

        return this.get();
    }
}
