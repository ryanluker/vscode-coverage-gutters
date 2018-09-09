import {readFile} from "fs";
import * as glob from "glob";
import {workspace, WorkspaceFolder} from "vscode";
import {IConfigStore} from "../extension/config";

export class FilesLoader {
    private configStore: IConfigStore;

    constructor(configStore: IConfigStore) {
        this.configStore = configStore;
    }

    /**
     * Finds all coverages files by xml and lcov and returns them
     */
    public async findCoverageFiles(): Promise<Set<string>> {
        const fileNames = [
            this.configStore.lcovFileName,
            this.configStore.xmlFileName,
        ];
        const files = await this.findCoverageInWorkspace(fileNames);
        if (!files.size) { throw new Error("Could not find a Coverage file!"); }
        return files;
    }

    /**
     * Takes files and converts to data strings for coverage consumption
     * @param files files that are to turned into data strings
     */
    public async loadDataFiles(files: Set<string>): Promise<Map<string, string>> {
        // Load the files and convert into data strings
        const dataFiles = new Map<string, string>();
        for (const file of files) {
            dataFiles.set(file, await this.load(file));
        }
        return dataFiles;
    }

    private load(path: string) {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) { return reject(err); }
                return resolve(data.toString());
            });
        });
    }

    private async findCoverageInWorkspace(fileNames: string[]) {
        let files = new Set<string>();
        for (const fileName of fileNames) {
            const coverage = await this.findCoverageForFileName(fileName);
            files = new Set([...files, ...coverage]);
        }
        return files;
    }

    private findCoverageForFileName(fileName: string): Promise<Set<string>> {
        const files = [];
        let actions: Array<Promise<Set<string>>> = new Array<Promise<Set<string>>>();
        if (workspace.workspaceFolders) {
            actions = workspace.workspaceFolders.map((workspaceFolder) => {
                return this.globFind(workspaceFolder, fileName);
            });
        }
        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                let totalCoverage = new Set<string>();
                coverageInWorkspaceFolders.forEach(
                    (coverage) => {
                        totalCoverage = new Set(
                            [...totalCoverage, ...coverage],
                        );
                    },
                );
                return totalCoverage;
            });
    }

    private globFind(
        workspaceFolder: WorkspaceFolder,
        fileName: string,
    ) {
        return new Promise<Set<string>>((resolve, reject) => {
            glob(`**/${fileName}`,
                {
                    cwd: workspaceFolder.uri.fsPath,
                    dot: true,
                    ignore: ["**/node_modules/**", "**/venv/**", "**/vendor/**"],
                    realpath: true,
                },
                (err, files) => {
                    if (!files || !files.length) { return resolve(new Set()); }
                    const setFiles = new Set<string>();
                    files.forEach((file) => setFiles.add(file));
                    return resolve(setFiles);
                },
            );
        });
    }
}
