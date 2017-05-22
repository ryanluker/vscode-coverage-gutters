import {Disposable, StatusBarItem, window} from "vscode";
import {IConfigStore} from "./config";

export class StatusBarToggler implements Disposable {
    public static readonly watchCommand = "extension.watchLcovAndVisibleEditors";
    public static readonly removeCommand = "extension.removeWatch";
    public static readonly watchText = "$(list-ordered) Watch Lcov and Editors";
    public static readonly removeText = "$(list-ordered) Remove Watch";
    public static readonly toolTip = "Coverage Gutters: Watch and Remove Helper";
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
