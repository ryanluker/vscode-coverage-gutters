import { Disposable, StatusBarItem, window } from "vscode";
import { Config } from "./config";

export class StatusBarToggler implements Disposable {
    private static readonly watchCommand = "pruner.watchCoverageAndVisibleEditors";
    private static readonly removeCommand = "pruner.removeWatch";
    private static readonly watchText = "Watch";
    private static readonly removeText = "Remove Watch";
    private static readonly listIcon = "$(list-ordered) ";
    private static readonly loadingIcon = "$(loading~spin) ";
    private static readonly toolTip = "Coverage Gutters: Watch and Remove Helper";
    public isActive: boolean;
    public isLoading: boolean;
    private statusBarItem: StatusBarItem;
    private configStore: Config;

    constructor(configStore: Config) {
        this.statusBarItem = window.createStatusBarItem();
        this.statusBarItem.command = StatusBarToggler.watchCommand;
        this.statusBarItem.text = StatusBarToggler.watchText;
        this.statusBarItem.tooltip = StatusBarToggler.toolTip;
        this.configStore = configStore;
        this.isLoading = false;

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

    public setLoading(loading: boolean = !this.isLoading) {
        this.isLoading = loading;
        this.update();
    }

    /**
     * Cleans up the statusBarItem if asked to dispose
     */
    public dispose() {
        this.statusBarItem.dispose();
    }

    /**
     * update
     * @description Updates the text displayed in the StatusBarToggler
     */
    private update() {
        if (this.isActive) {
            this.statusBarItem.command = StatusBarToggler.removeCommand;
            this.statusBarItem.text = StatusBarToggler.removeText;
        } else {
            this.statusBarItem.command = StatusBarToggler.watchCommand;
            this.statusBarItem.text = StatusBarToggler.watchText;
        }
        if (this.isLoading) {
            this.statusBarItem.text = StatusBarToggler.loadingIcon + this.statusBarItem.text;
        } else {
            this.statusBarItem.text = StatusBarToggler.listIcon + this.statusBarItem.text;
        }
    }
}
