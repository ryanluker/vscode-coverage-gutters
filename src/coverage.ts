import {basename} from "path";
import {QuickPickItem} from "vscode";

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
    public async pickFile(filePaths: string[], placeHolder: string): Promise<string | undefined> {
        let pickedFile: string;
        if (filePaths.length === 1) {
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
            pickedFile = item.description;
        }
        return pickedFile;
    }

    public async findCoverageFiles(): Promise<string[]> {
        const lcovFiles = await this.findLcovs();
        const xmlFiles = await this.findXmls();

        const files = [].concat(lcovFiles, xmlFiles);
        if (!files.length) { throw new Error("Could not find a Coverage file!"); }
        return files;
    }

    public findReports(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.glob.find(
                `**/coverage/**/index.html`,
                { ignore: "**/node_modules/**", cwd: this.vscode.getRootPath(), realpath: true, dot: true },
                (err, files) => {
                    if (!files || !files.length) { return reject("Could not find a Coverage Report file!"); }
                    return resolve(files);
                });
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

    private findLcovs(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.glob.find(
                `**/${this.configStore.lcovFileName}`,
                { ignore: "**/node_modules/**", cwd: this.vscode.getRootPath(), realpath: true, dot: true },
                (err, files) => {
                    if (!files || !files.length) { return resolve([]); }
                    return resolve(files);
                });
        });
    }

    private findXmls(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.glob.find(
                `**/${this.configStore.xmlFileName}`,
                { ignore: "**/node_modules/**", cwd: this.vscode.getRootPath(), realpath: true, dot: true },
                (err, files) => {
                    if (!files || !files.length) { return resolve([]); }
                    return resolve(files);
                });
        });
    }
}
