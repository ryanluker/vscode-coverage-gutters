import * as glob from "glob";
import {Section} from "lcov-parse";
import {extname} from "path";
import {TextEditor, Uri, workspace} from "vscode";
import {OutputChannel} from "vscode";
import {Config} from "../extension/config";
import {Reporter} from "../extension/reporter";
import {areFilesRelativeEquals, normalizeFileName} from "../helpers";

export class SectionFinder {
    private configStore: Config;
    private outputChannel: OutputChannel;
    private eventReporter: Reporter;
    private folderCache: any;

    constructor(
        configStore: Config,
        outputChannel: OutputChannel,
        eventReporter: Reporter,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
        this.clearCache();
    }

    /**
     * Compare the paths using relative logic or absolute
     * @param textEditor editor with current active file
     * @param sections sections to compare against open editors
     */
    public findSectionForEditor(
        textEditor: TextEditor,
        sections: Map<string, Section>,
    ): Section | undefined {
        const sectionsArray = Array.from(sections.values());
        const fileName = textEditor.document.fileName;

        // Check each section against the currently active document filename
        const foundSection = sectionsArray.find((section) => this.checkSection(section, fileName));
        if (!foundSection) { return ; }

        const filePath = foundSection.file;
        const filePathMessage = `[${Date.now()}][renderer][section file path]: ${filePath}`;
        this.outputChannel.appendLine(filePathMessage);

        // log file type
        this.eventReporter.sendEvent("system", "renderer-fileType", extname(filePath));

        return foundSection;
    }

    /**
     * Clears current cache for workspace folders
     */
    public clearCache() {
        this.folderCache = {};
    }

    /**
     * Checks for a matching section file against the a given fileName
     * @param section data section to check against filename
     * @param fileName string based filename to compare with
     */
    private checkSection(section: Section, fileName: string): boolean {
        const editorFileUri = Uri.file(fileName);
        const workspaceFolder = workspace.getWorkspaceFolder(editorFileUri);
        if (!workspaceFolder) { return false; }

        // Check if we need to swap any fragments of the file path with a remote fragment
        // IE: /var/www/ -> /home/me/
        const sectionFileName = this.resolveFileName(section.file);
        const workspaceFolderName = workspaceFolder.name;
        try {
            // Check for the secion having a partial path
            section.file = this.convertPartialPathsToAbsolute(sectionFileName);
        } catch (error) {
            const absoluteErrorMessage = `[${Date.now()}][sectionFinder][path]${section.file}[error]${error}`;
            this.outputChannel.appendLine(absoluteErrorMessage);
        }
        const sectionFile = normalizeFileName(section.file);
        const editorFile = normalizeFileName(fileName);

        return areFilesRelativeEquals(sectionFile, editorFile, workspaceFolderName);
    }

    /**
     * Resolves remote file paths by removing those fragments and replacing with local ones.
     * EG: /var/www/project/file.js -> /home/dev/project/file.js
     * Note: this only runs if the developer adds a remotePathResolve setting
     * @param fileName section file path
     */
    private resolveFileName(fileName: string): string {
        let potentialFileName = fileName;
        const remoteLocalPaths = this.configStore.remotePathResolve;
        if (remoteLocalPaths) {
            const remoteFragment = remoteLocalPaths[0];
            const localFragment = remoteLocalPaths[1];
            const paths = fileName.split(remoteFragment);

            // If we have a length of two we have a match and can swap the paths
            // Note: this is because split will give us an array of two with the first element
            // being an empty string and the second being the project path.
            if (paths.length === 2) {
                potentialFileName = localFragment + paths[1];
            }
        }
        return potentialFileName;
    }

    /**
     * Takes paths and tries to make them absolute
     * based on currently open workspaceFolders
     * @param path potential partial path to be converted
     */
    private convertPartialPathsToAbsolute(path: string): string {
        const files: string[] = [];

        if (!workspace.workspaceFolders) { return path; }
        // Path is already absolute
        // Note 1: some coverage generators can start with no slash #160
        // Note 2: accounts for windows and linux style file paths
        // windows as they start with drives (ie: c:\ or C:/)
        // linux as they start with forward slashes
        // both windows and linux use ./ or .\ for relative
        const unixRoot = path.startsWith("/");
        const windowsRoot = path[1] === ":" && (path[2] === "\\" || path[2] === "/");
        if (unixRoot || windowsRoot) {
            return path;
        }

        // look over all workspaces for the path
        const folders = workspace.workspaceFolders.map(
            (folder) => folder.uri.fsPath,
        );
        folders.map((f) => this.getPossibleFiles(f, path, files));

        if (files.length === 0) {
            throw Error(`File path not found in open workspaces ${path}`);
        }
        if (files.length > 1) {
            throw Error(`Found too many files with partial path ${path}`);
        }
        return files[0];
    }

    /**
     * Returns all files that are under given folder (iexcludes file in configStore.ignoredPathGlobs)
     * Returned files have absolute path and use "/" as folder seperator
     * Uses caching to reduce FS operations
     * @param folder parent folder
     */
    private getFilesForFolder(folder: string): string[] {
        if (this.folderCache[folder] === undefined) {
            this.outputChannel.appendLine(`[${Date.now()}][sectionFinder]: Getting all files for ${folder}`);
            let allFiles = glob.sync(
                `**`,
                {
                    cwd: folder,
                    dot: true,
                    ignore: this.configStore.ignoredPathGlobs,
                    realpath: true,
                },
            );
            allFiles = allFiles.map((f) => {
                return f.replace(/\\/g, "/");
            });
            this.outputChannel.appendLine(`[${Date.now()}][sectionFinder]: Found ${allFiles.length} files`);
            this.folderCache[folder] = allFiles;
        }
        return this.folderCache[folder];
    }

    /**
     * Converts given relative path to string that can be used for searching regardles of OS
     * @param relativePath relative path to be converted
     */
    private makePathSearchable(relativePath: string): string {
        relativePath = relativePath.replace(/\\/g, "/");
        if (relativePath.indexOf("./") === 0) {
            return relativePath.substring(1); // remove leading "."
        }
        if (relativePath.indexOf("/") === 0) { // should not happen - path should be relative
            return relativePath;
        }
        return `/${relativePath}`; // add / at the begining so that we find that specific directory
    }

    /**
     * Fills provided files array with files that match given relative path in given parent folder
     * @param folder parent folder
     * @param relativePath path of files
     * @param files Array where results will be stored
     */
    private getPossibleFiles(folder: string, relativePath: string, files: string[]) {
        const folderFiles = this.getFilesForFolder(folder);
        const searchablePath = this.makePathSearchable(relativePath);
        // filter files based on path
        const filteredFiles = folderFiles.filter((f) => f.endsWith(searchablePath));
        files.push(...filteredFiles);
    }
}
