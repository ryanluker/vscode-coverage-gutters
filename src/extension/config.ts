import {
    commands,
    DecorationRenderOptions,
    ExtensionContext,
    OverviewRulerLane,
    window,
    workspace,
} from "vscode";

export class Config {
    private context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this.context = context;
        this.setup();

        // Reload the cached values if the configuration changes
        workspace.onDidChangeConfiguration(this.setup.bind(this));
    }

    private setup() {
        const rootCustomConfig = workspace.getConfiguration("pruner.customizable");

        // Customizable UI configurations
        const configsCustom = Object.keys(rootCustomConfig);
        for (const element of configsCustom) {
            commands.executeCommand(
                "setContext",
                "config.pruner.customizable." + element,
                rootCustomConfig.get(element));
        }

        const rootConfig = workspace.getConfiguration("pruner");

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

        // Add the manual coverage file path(s) if present
        this.manualCoverageFilePaths = rootConfig.get("manualCoverageFilePaths") as string[];
        const hasManualCoverageFilePaths = !!this.manualCoverageFilePaths.length;
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
