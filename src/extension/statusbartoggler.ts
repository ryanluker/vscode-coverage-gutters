import { Disposable, StatusBarItem, window } from "vscode";
import { Config } from "./config";

export class StatusBarToggler implements Disposable {
    private static readonly coverageText = "Coverage";

    private static readonly loadingText = ["$(loading~spin)", StatusBarToggler.coverageText].join(" ");

    private static readonly idleIcon = "$(circle-large-outline)";

    private static readonly watchCommand = "coverage-gutters.watchCoverageAndVisibleEditors";
    private static readonly watchText = [StatusBarToggler.idleIcon, "Watch"].join(" ");
    private static readonly watchToolTip = "Coverage Gutters: Click to watch workspace.";

    private static readonly removeCommand = "coverage-gutters.removeWatch";
    private static readonly removeWatchToolTip = "Coverage Gutters: Click to remove watch from workspace.";

    public isActive: boolean | undefined;
    public isLoading: boolean;
    public lineCoverage: string | undefined;
    private statusBarItem: StatusBarItem;
    private configStore: Config;

    constructor(configStore: Config) {
        this.statusBarItem = window.createStatusBarItem();
        this.statusBarItem.command = StatusBarToggler.watchCommand;
        this.statusBarItem.text = StatusBarToggler.watchText;
        this.statusBarItem.tooltip = StatusBarToggler.watchToolTip;
        this.configStore = configStore;
        this.isLoading = false;
        this.lineCoverage = undefined;

        if (this.configStore.showStatusBarToggler) { this.statusBarItem.show(); }
    }

    public get statusText() {
        return this.statusBarItem.text;
    }

    /**
     * Toggles the status bar item from watch to remove and vice versa
     */
    public toggle(active: boolean) {
        this.isActive = active;

        this.update();
    }

    public setLoading(loading = !this.isLoading) {
        this.isLoading = loading;
        this.update();
    }

    public setCoverage(linePercentage: number | undefined ) {
        if (Number.isFinite(linePercentage)) {
            this.lineCoverage = `${linePercentage}%`;
        } else {
            this.lineCoverage = undefined;
        }
        this.update();
    }

    /**
     * Cleans up the statusBarItem if asked to dispose
     */
    public dispose() {
        this.statusBarItem.dispose();
    }

    private getStatusBarText() {
        if (this.isLoading) {
            return StatusBarToggler.loadingText;
        }
        if (this.isActive) {
            return [StatusBarToggler.idleIcon, this.lineCoverage || "No", StatusBarToggler.coverageText].join(" ");
        }
        return StatusBarToggler.watchText;
    }

    /**
     * update
     * @description Updates the text and tooltip displayed by the StatusBarToggler
     */
    private update() {
        this.statusBarItem.text = this.getStatusBarText();

        if (this.isActive) {
            this.statusBarItem.command = StatusBarToggler.removeCommand;
            this.statusBarItem.tooltip = StatusBarToggler.removeWatchToolTip;
        } else {
            this.statusBarItem.command = StatusBarToggler.watchCommand;
            this.statusBarItem.tooltip = StatusBarToggler.watchToolTip;
        }
    }
}
