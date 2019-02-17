import { readFile } from "fs";
import * as glob from "glob";
import { basename } from "path";
import {
    QuickPickItem,
    window,
    workspace,
    WorkspaceFolder,
} from "vscode";

import { Config } from "../extension/config";

export class Coverage {
    private configStore: Config;

    constructor(configStore: Config) {
        this.configStore = configStore;
    }

    /**
     * Takes an array of file strings and a placeHolder message.
     * Displays the quick picker vscode modal and lets the user choose a file path
     * @param filePaths
     * @param placeHolder
     */
    public async pickFile(filePaths: string[] | string, placeHolder: string): Promise<string | undefined> {
        let pickedFile: string | undefined;
        if (typeof filePaths === "string") {
            pickedFile = filePaths;
        } else if (filePaths.length === 1) {
            pickedFile = filePaths[0];
        } else {
            const fileQuickPicks = filePaths.map((filePath) => {
                return {
                    description: filePath,
                    label: basename(filePath),
                };
            });

            const item = await window.showQuickPick<QuickPickItem>(
                fileQuickPicks,
                {placeHolder},
            );
            if (!item) { throw new Error("Did not choose a file!"); }

            pickedFile = item.description;
        }
        return pickedFile;
    }

    public findReports(): Promise<string[]> {
        let actions: Array<Promise<string[]>> = new Array<Promise<string[]>>();

        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders) {
            actions = workspaceFolders.map((workspaceFolder) => {
                return this.globFind(workspaceFolder, this.configStore.reportFileName);
            });
        }

        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                // Spread first array to properly concat the file arrays from the globFind
                return new Array().concat(...coverageInWorkspaceFolders);
            });
    }

    public load(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) { return reject(err); }
                return resolve(data.toString());
            });
        });
    }

    private globFind(workspaceFolder: WorkspaceFolder, fileName: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            glob(
                `**/${fileName}`,
                {
                    cwd: workspaceFolder.uri.fsPath,
                    dot: true,
                    ignore: this.configStore.ignoredPathGlobs,
                    realpath: true,
                },
                (err, files) => {
                    if (!files || !files.length) { return resolve([]); }
                    return resolve(files);
                },
            );
        });
    }
}
