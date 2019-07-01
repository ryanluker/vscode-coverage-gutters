import {
    commands,
    DecorationRenderOptions,
    ExtensionContext,
    OverviewRulerLane,
    TextEditorDecorationType,
    window,
    workspace,
} from "vscode";
import {Reporter} from "./reporter";

export class Config {
    public coverageFileNames: string[];
    public reportFileName: string;
    public fullCoverageDecorationType: TextEditorDecorationType;
    public partialCoverageDecorationType: TextEditorDecorationType;
    public noCoverageDecorationType: TextEditorDecorationType;
    public showStatusBarToggler: boolean;
    public ignoredPathGlobs: string;
    public remotePathResolve: string[];
    public manualCoverageFilePaths: string[];

    private context: ExtensionContext;
    private reporter: Reporter;

    constructor(context: ExtensionContext, reporter: Reporter) {
        this.context = context;
        this.reporter = reporter;
        this.setup();

        // Reload the cached values if the configuration changes
        workspace.onDidChangeConfiguration(this.setup.bind(this));
    }

    private setup() {
        const rootCustomConfig = workspace.getConfiguration("coverage-gutters.customizable");

        // Customizable UI configurations
        const configsCustom = Object.keys(rootCustomConfig);
        for (const element of configsCustom) {
            commands.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                rootCustomConfig.get(element));
        }

        const rootConfig = workspace.getConfiguration("coverage-gutters");

        // Basic configurations
        // TODO: remove lcovname and xmlname in 3.0.0 release
        const lcovName = rootConfig.get("lcovname") as string;
        const xmlName = rootConfig.get("xmlname") as string;
        this.reportFileName = rootConfig.get("coverageReportFileName") as string;
        this.coverageFileNames = rootConfig.get("coverageFileNames") as string[];
        this.coverageFileNames.push(lcovName, xmlName);
        this.coverageFileNames = this.coverageFileNames.filter((name) => !!name.trim());

        // Make fileNames unique
        this.coverageFileNames = [...new Set(this.coverageFileNames)];

        // Load ignored paths
        this.ignoredPathGlobs = rootConfig.get("ignoredPathGlobs") as string;

        const STATUS_BAR_TOGGLER = "status-bar-toggler-watchCoverageAndVisibleEditors-enabled";
        this.showStatusBarToggler = rootCustomConfig.get(STATUS_BAR_TOGGLER) as boolean;

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

        // Setup info for decorations
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

        // Generate decorations
        this.noCoverageDecorationType = window.createTextEditorDecorationType(noDecoration);
        this.partialCoverageDecorationType = window.createTextEditorDecorationType(partialDecoration);
        this.fullCoverageDecorationType = window.createTextEditorDecorationType(fullDecoration);

        // Assign the key and resolved fragment
        this.remotePathResolve = rootConfig.get("remotePathResolve") as string[];
        const hasRemotePathResolve = !!this.remotePathResolve.length;
        this.reporter.sendEvent("config", "remotePathResolve", hasRemotePathResolve.toString());

        // Add the manual coverage file path(s) if present
        this.manualCoverageFilePaths = rootConfig.get("manualCoverageFilePaths") as string[];
        const hasManualCoverageFilePaths = !!this.manualCoverageFilePaths.length;
        this.reporter.sendEvent(
            "config",
            "hasManualCoverageFilePaths",
            hasManualCoverageFilePaths.toString()
        );
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
        if (full && full.dark && !full.dark.gutterIconPath) { delete full.dark.gutterIconPath; }
        if (full && full.light && !full.light.gutterIconPath) { delete full.light.gutterIconPath; }
        if (partial && partial.dark && !partial.dark.gutterIconPath) { delete partial.dark.gutterIconPath; }
        if (partial && partial.light && !partial.light.gutterIconPath) { delete partial.light.gutterIconPath; }
        if (no && no.dark && !no.dark.gutterIconPath) { delete no.dark.gutterIconPath; }
        if (no && no.light && !no.light.gutterIconPath) { delete no.light.gutterIconPath; }
    }
}
