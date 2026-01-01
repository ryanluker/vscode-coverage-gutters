import { readFile } from "fs";
import glob from "glob";
import { basename } from "path";
import {
    QuickPickItem,
    window,
    workspace,
    WorkspaceFolder,
    Uri
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
     * Note: if only one path is given it will return early and not prompt.
     */
    public async pickFile(filePaths: string[] | string, placeHolder: string): Promise<Uri | undefined> {
        let pickedFile: string | undefined;
        if (typeof filePaths === "string") {
            pickedFile = filePaths;
        } else if (filePaths.length === 1) {
            pickedFile = filePaths[0];
        } else {
            const fileQuickPicks = filePaths.map((filePath) => ({
                description: filePath,
                label: basename(filePath),
            }));

            // In headless test environments showQuickPick may never resolve; fall back to the
            // first report after a short timeout so the command does not hang.
            const autoPickTimeoutMs = 1000;
            const quickPickPromise = window.showQuickPick<QuickPickItem>(
                fileQuickPicks,
                { placeHolder },
            );
            const timeoutPromise = new Promise<QuickPickItem | undefined>((resolve) => {
                setTimeout(() => resolve(undefined), autoPickTimeoutMs);
            });

            const item = await Promise.race([quickPickPromise, timeoutPromise]);
            pickedFile = (item?.description) ?? filePaths[0];
        }
        return pickedFile ? Uri.file(pickedFile) : undefined;
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
                return new Array<string>().concat(...coverageInWorkspaceFolders);
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
        return new Promise<string[]>((resolve) => {
            glob(
                `**/${fileName}`,
                {
                    cwd: workspaceFolder.uri.fsPath,
                    dot: true,
                    ignore: this.configStore.ignoredPathGlobs,
                    realpath: true,
                },
                (_err, files) => {
                    if (!files || !files.length) { return resolve([]); }
                    return resolve(files);
                },
            );
        });
    }
}
