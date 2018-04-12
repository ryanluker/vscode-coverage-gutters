import {readFile} from "fs";
import * as glob from "glob";
import {workspace, WorkspaceFolder} from "vscode";
import {IConfigStore} from "./config";

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
    public async loadDataFiles(files: Set<string>): Promise<Set<string>> {
        // Load the files and convert into data strings
        const dataFiles = new Set<string>();
        files.forEach(async (file) => {
            dataFiles.add(await this.load(file));
        });
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
        fileNames.forEach(async (fileName) => {
            const coverage = await this.findCoverageForFileName(fileName);
            files = new Set([...files, ...coverage]);
        });
        return files;
    }

    private findCoverageForFileName(fileName: string): Promise<string[]> {
        const files = [];
        const actions = workspace.workspaceFolders.map((workspaceFolder) => {
            return this.globFind(workspaceFolder, fileName);
        });
        return Promise.all(actions)
            .then((coverageInWorkspaceFolders) => {
                // Spread the array first to properly concat the file arrays
                // from the globFind
                return [].concat(...coverageInWorkspaceFolders);
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
                    ignore: "**/node_modules/**",
                    realpath: true,
                },
                (err, files) => {
                    if (!files || !files.length) { return resolve(new Set()); }
                    const setFiles = new Set<string>();
                    files.forEach(setFiles.add);
                    return resolve(setFiles);
                },
            );
        });
    }
}
