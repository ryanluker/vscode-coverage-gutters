import {Disposable, StatusBarItem, window} from "vscode";
import {IConfigStore} from "./config";

export class StatusBarToggler implements Disposable {
    private static readonly watchCommand = "extension.watchCoverageAndVisibleEditors";
    private static readonly removeCommand = "extension.removeWatch";
    private static readonly watchText = "$(list-ordered) Watch";
    private static readonly removeText = "$(list-ordered) Remove Watch";
    private static readonly toolTip = "Coverage Gutters: Watch and Remove Helper";
    private statusBarItem: StatusBarItem;
    private configStore: IConfigStore;

    constructor(configStore: IConfigStore) {
        this.statusBarItem = window.createStatusBarItem();
        this.statusBarItem.command = StatusBarToggler.watchCommand;
        this.statusBarItem.text = StatusBarToggler.watchText;
        this.statusBarItem.tooltip = StatusBarToggler.toolTip;
        this.configStore = configStore;
        if (this.configStore.showStatusBarToggler) { this.statusBarItem.show(); }
    }

    /**
     * Toggles the status bar item from watch to remove and vice versa
     */
    public toggle() {
        if (this.statusBarItem.command === StatusBarToggler.watchCommand) {
            this.statusBarItem.command = StatusBarToggler.removeCommand;
            this.statusBarItem.text = StatusBarToggler.removeText;
        } else {
            this.statusBarItem.command = StatusBarToggler.watchCommand;
            this.statusBarItem.text = StatusBarToggler.watchText;
        }
    }

    /**
     * Cleans up the statusBarItem if asked to dispose
     */
    public dispose() {
        this.statusBarItem.dispose();
    }
}
