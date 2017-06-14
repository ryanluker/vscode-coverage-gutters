import {IConfigStore} from "./config";
import {InterfaceFs} from "./wrappers/fs";
import {InterfaceGlob} from "./wrappers/glob";
import {InterfaceVscode} from "./wrappers/vscode";

export class Lcov {
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

    public find(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.glob.find(
                `**/${this.configStore.lcovFileName}`,
                { ignore: "**/node_modules/**", cwd: this.vscode.getRootPath(), realpath: true },
                (err, files) => {
                    if (!files || !files.length) { return reject("Could not find a lcov file!"); }
                    if (files.length > 1) { return reject("More then one lcov file found!"); }
                    return resolve(files[0]);
                });
        });
    }

    public load(lcovPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.fs.readFile(lcovPath, (err, data) => {
                if (err) { return reject(err); }
                return resolve(data.toString());
            });
        });
    }
}
