import {basename} from "path";
import {QuickPickItem, Uri, WorkspaceFolder} from "vscode";

import {IConfigStore} from "./config";
import {InterfaceFs} from "./wrappers/fs";
import {InterfaceGlob} from "./wrappers/glob";
import {InterfaceVscode} from "./wrappers/vscode";

export class Coverage {
    private configStore: IConfigStore;
    private glob: InterfaceGlob;
    private vscode: InterfaceVscode;
    private fs: InterfaceFs;

    constructor(
        configStore: IConfigStore,
        glob: InterfaceGlob,
        vscode: InterfaceVscode,
        fs: InterfaceFs,
    ) {
        this.configStore = configStore;
        this.glob = glob;
        this.vscode = vscode;
        this.fs = fs;
    }

    /**
     * Takes an array of file strings and a placeHolder message.
     * Displays the quick picker vscode modal and lets the user choose a file path
     * @param filePaths
     * @param placeHolder
     */
    public async pickFile(filePaths: string[] | string, placeHolder: string): Promise<string | undefined> {
        let pickedFile: string;
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

            const item = await this.vscode.showQuickPick<QuickPickItem>(
                fileQuickPicks,
                {placeHolder},
            );
            if (!item) { throw new Error("Did not choose a file!"); }

            pickedFile = item.description;
        }
        return pickedFile;
    }

    public async findCoverageFiles(): Promise<string[]> {
        const lcovFiles = await this.findLcovs();
        const xmlFiles = await this.findXmls();

        // Remove duplicate file paths between workspaces
        const files = [...new Set<string>([].concat(lcovFiles, xmlFiles))];
        if (!files.length) { throw new Error("Could not find a Coverage file!"); }
        return files;
    }

    public findReports(): Promise<string[]> {
        const files = [];
        const actions = this.vscode.getWorkspaceFolders().map((workspaceFolder) => {
            return this.globFind(workspaceFolder, "coverage/**/index.html");
        });
        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                // Spread first array to properly concat the file arrays from the globFind
                return [].concat(...coverageInWorkspaceFolders);
            });
    }

    public load(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.fs.readFile(path, (err, data) => {
                if (err) { return reject(err); }
                return resolve(data.toString());
            });
        });
    }

    private globFind(workspaceFolder: WorkspaceFolder, fileName: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.glob.find(
                `**/${fileName}`,
                {
                    cwd: workspaceFolder.uri.fsPath,
                    dot: true,
                    ignore: "**/node_modules/**",
                    realpath: true,
                },
                (err, files) => {
                    if (!files || !files.length) { return resolve([]); }
                    return resolve(files);
                });
        });
    }

    private findLcovs(): Promise<string[]> {
        const files = [];
        const actions = this.vscode.getWorkspaceFolders().map((workspaceFolder) => {
            return this.globFind(workspaceFolder, this.configStore.lcovFileName);
        });
        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                // Spread first array to properly concat the file arrays from the globFind
                return [].concat(...coverageInWorkspaceFolders);
            });
    }

    private findXmls(): Promise<string[]> {
        const files = [];
        const actions = this.vscode.getWorkspaceFolders().map((workspaceFolder) => {
            return this.globFind(workspaceFolder, this.configStore.xmlFileName);
        });
        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                // Spread first array to properly concat the file arrays from the globFind
                return [].concat(...coverageInWorkspaceFolders);
            });
    }
}
