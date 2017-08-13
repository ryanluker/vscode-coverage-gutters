import {
    DecorationRenderOptions,
    ExtensionContext,
    OverviewRulerLane,
    TextEditorDecorationType,
    WorkspaceConfiguration,
} from "vscode";
import {Reporter} from "./reporter";
import {InterfaceVscode} from "./wrappers/vscode";

export interface IConfigStore {
    lcovFileName: string;
    fullCoverageDecorationType: TextEditorDecorationType;
    partialCoverageDecorationType: TextEditorDecorationType;
    noCoverageDecorationType: TextEditorDecorationType;
    altSfCompare: boolean;
    showStatusBarToggler: boolean;
}

export class Config {
    private vscode: InterfaceVscode;
    private context: ExtensionContext;
    private reporter: Reporter;

    private lcovFileName: string;
    private fullCoverageDecorationType: TextEditorDecorationType;
    private partialCoverageDecorationType: TextEditorDecorationType;
    private noCoverageDecorationType: TextEditorDecorationType;
    private altSfCompare: boolean;
    private showStatusBarToggler: boolean;

    constructor(vscode: InterfaceVscode, context: ExtensionContext, reporter: Reporter) {
        this.vscode = vscode;
        this.context = context;
        this.reporter = reporter;
        this.setup();
    }

    public get(): IConfigStore {
        return {
            altSfCompare: this.altSfCompare,
            fullCoverageDecorationType: this.fullCoverageDecorationType,
            lcovFileName: this.lcovFileName,
            noCoverageDecorationType: this.noCoverageDecorationType,
            partialCoverageDecorationType: this.partialCoverageDecorationType,
            showStatusBarToggler: this.showStatusBarToggler,
        };
    }

    public setup() {
        const rootCustomConfig = this.vscode.getConfiguration("coverage-gutters.customizable");

        // Customizable UI configurations
        const configsCustom = Object.keys(rootCustomConfig);
        for (const element of configsCustom) {
            this.vscode.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                rootCustomConfig.get(element));
        }

        const rootConfig = this.vscode.getConfiguration("coverage-gutters");

        // Basic configurations
        this.lcovFileName = rootConfig.get("lcovname") as string;
        this.altSfCompare = rootConfig.get("altSfCompare") as boolean;
        const STATUS_BAR_TOGGLER = "status-bar-toggler-watchLcovAndVisibleEditors-enabled";
        this.showStatusBarToggler = rootCustomConfig.get(STATUS_BAR_TOGGLER) as boolean;
        this.reporter.sendEvent("config", "lcovFileName", this.lcovFileName);
        this.reporter.sendEvent("config", "altSfCompare", this.altSfCompare.toString());

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
        this.reporter.sendEvent("config", "showGutterCoverage", showGutterCoverage);
        this.reporter.sendEvent("config", "showLineCoverage", showLineCoverage);
        this.reporter.sendEvent("config", "showRulerCoverage", showRulerCoverage);

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

        this.cleanupEmptyGutterIcons(fullDecoration, partialDecoration, noDecoration);

        this.noCoverageDecorationType = this.vscode.createTextEditorDecorationType(noDecoration);
        this.partialCoverageDecorationType = this.vscode.createTextEditorDecorationType(partialDecoration);
        this.fullCoverageDecorationType = this.vscode.createTextEditorDecorationType(fullDecoration);
    }

    /**
     * removes empty gutter icons to allow for break point usage
     * @param full
     * @param partial
     * @param no
     */
    private cleanupEmptyGutterIcons(
        full: DecorationRenderOptions,
        partial: DecorationRenderOptions,
        no: DecorationRenderOptions,
    ): void {
        if (!full.dark.gutterIconPath) { delete full.dark.gutterIconPath; }
        if (!full.light.gutterIconPath) { delete full.light.gutterIconPath; }
        if (!partial.dark.gutterIconPath) { delete partial.dark.gutterIconPath; }
        if (!partial.light.gutterIconPath) { delete partial.light.gutterIconPath; }
        if (!no.dark.gutterIconPath) { delete no.dark.gutterIconPath; }
        if (!no.light.gutterIconPath) { delete no.light.gutterIconPath; }
    }
}
