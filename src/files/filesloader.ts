import { existsSync } from "fs";
import { readFile } from "fs/promises";
import glob from "glob";
import { promisify } from "util";
import { window, workspace, WorkspaceFolder } from "vscode";
import { Config } from "../extension/config";

const globAsync = promisify(glob);

export class FilesLoader {
    private configStore: Config;

    constructor(configStore: Config) {
        this.configStore = configStore;
    }

    /**
     * Finds all coverages files by xml and lcov and returns them
     * Note: Includes developer override via "manualCoverageFilePaths"
     */
    public async findCoverageFiles(): Promise<Set<string>> {
        // Developers can manually define their absolute coverage paths
        if (this.configStore.manualCoverageFilePaths.length) {
            const existingFiles = this.configStore.manualCoverageFilePaths.filter((file) => {
                if (!existsSync(file)) {
                    window.showWarningMessage(`manualCoverageFilePaths contains "${file}" which does not exist!`);
                    return false;
                }
                return true;
            });
            return new Set(existingFiles);
        } else {
            const fileNames = this.configStore.coverageFileNames;
            const files = await this.findCoverageInWorkspace(fileNames);
            if (!files.size) {
                window.showWarningMessage("Could not find a Coverage file! Searched for " + fileNames.join(", "));
                return new Set();
            }
            return files;
        }
    }

    /**
     * Takes files and converts to data strings for coverage consumption
     * @param files files that are to turned into data strings
     */
    public async loadDataFiles(files: Set<string>): Promise<Map<string, string>> {
        // Load all files in parallel for better performance
        const loadPromises = Array.from(files).map(async (file) => {
            const data = await this.load(file);
            return [file, data] as const;
        });

        const results = await Promise.all(loadPromises);
        return new Map(results);
    }

    private async load(path: string): Promise<string> {
        const data = await readFile(path, 'utf-8');
        return data;
    }

    private async findCoverageInWorkspace(fileNames: string[]) {
        const files = new Set<string>();
        for (const fileName of fileNames) {
            const coverage = await this.findCoverageForFileName(fileName);
            // Efficiently add all items without creating new Set
            coverage.forEach(file => files.add(file));
        }
        return files;
    }

    private findCoverageForFileName(fileName: string): Promise<Set<string>> {
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

    private async globFind(
        workspaceFolder: WorkspaceFolder,
        fileName: string,
    ): Promise<Set<string>> {
        try {
            const files = await globAsync(`${this.configStore.coverageBaseDir}/${fileName}`, {
                cwd: workspaceFolder.uri.fsPath,
                dot: true,
                ignore: this.configStore.ignoredPathGlobs,
                realpath: true,
                strict: false,
            });

            if (!files || !files.length) {
                return new Set();
            }

            return new Set(files);
        } catch (err) {
            window.showWarningMessage(`An error occured while looking for the coverage file ${err}`);
            return new Set();
        }
    }
}
