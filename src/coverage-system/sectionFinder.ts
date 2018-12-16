import * as glob from "glob";
import {Section} from "lcov-parse";
import {extname} from "path";
import {TextEditor, Uri, workspace} from "vscode";
import {OutputChannel} from "vscode";

import {IConfigStore} from "../extension/config";
import {Reporter} from "../extension/reporter";
import {areFilesRelativeEquals, normalizeFileName} from "../helpers";

export class SectionFinder {
    private configStore: IConfigStore;
    private outputChannel: OutputChannel;
    private eventReporter: Reporter;

    constructor(
        configStore: IConfigStore,
        outputChannel: OutputChannel,
        eventReporter: Reporter,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
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
        const findSection = (section): boolean => {
            const editorFileUri = Uri.file(textEditor.document.fileName);
            const workspaceFolder = workspace.getWorkspaceFolder(editorFileUri);
            if (!workspaceFolder) { return false; }

            const workspaceFolderName = workspaceFolder.name;
            try {
                // Check for the secion having a partial path
                section.file = this.convertPartialPathsToAbsolute(section.file);
            } catch (error) {
                const absoluteErrorMessage = `[${Date.now()}][sectionFinder][path]${section.file}[error]${error}`;
                this.outputChannel.appendLine(absoluteErrorMessage);
            }
            const sectionFile = normalizeFileName(section.file);
            const editorFile = normalizeFileName(textEditor.document.fileName);

            return areFilesRelativeEquals(sectionFile, editorFile, workspaceFolderName);
        };

        const sectionsArray = Array.from(sections.values());
        const foundSection = sectionsArray.find(findSection);

        if (!foundSection) { return ; }

        const filePath = foundSection.file;
        const filePathMessage = `[${Date.now()}][renderer][section file path]: ${filePath}`;
        this.outputChannel.appendLine(filePathMessage);

        // log file type
        this.eventReporter.sendEvent("system", "renderer-fileType", extname(filePath));

        return foundSection;
    }

    /**
     * Takes paths and tries to make them absolute
     * based on currently open workspaceFolders
     * @param path potential partial path to be converted
     */
    private convertPartialPathsToAbsolute(path: string): string {
        const files: string[] = [];
        const globFind = (folder: string) => {
            // find the path in the workspace folder
            const possibleFiles = glob.sync(
                `**/${path}`,
                {
                    cwd: folder,
                    dot: true,
                    ignore: this.configStore.ignoredPathGlobs,
                    realpath: true,
                },
            );
            if (possibleFiles.length) {
                files.push(...possibleFiles);
            }
        };

        if (!workspace.workspaceFolders) { return path; }
        // Path is already absolute
        // Note 1: some coverage generators can start with no slash #160
        // Note 2: accounts for windows and linux style file paths
        // windows as they start with drives (ie: c:\)
        // linux as they start with forward slashes
        // both windows and linux use ./ or .\ for relative
        const unixRoot = path.startsWith("/");
        const windowsRoot = path[1] === ":" && path[2] === "\\";
        if (unixRoot || windowsRoot) {
            return path;
        }

        // look over all workspaces for the path
        const folders = workspace.workspaceFolders.map(
            (folder) => folder.uri.fsPath,
        );
        folders.map(globFind);

        if (files.length === 0) {
            throw Error(`File path not found in open workspaces ${path}`);
        }
        if (files.length > 1) {
            throw Error(`Found too many files with partial path ${path}`);
        }
        return files[0];
    }
}
