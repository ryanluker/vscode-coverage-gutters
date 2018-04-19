import {Section} from "lcov-parse";
import {
    Disposable,
    FileSystemWatcher,
    window,
    workspace,
} from "vscode";

import {IConfigStore} from "./config";
import {FilesLoader} from "./filesloader";
import {LcovParser} from "./lcovparser";
import {Renderer} from "./renderer";

enum Status {
    ready,
    initializing,
    loading,
    rendering,
    error,
}

export class CoverageService {
    private configStore: IConfigStore;
    private filesLoader: FilesLoader;
    private renderer: Renderer;
    private lcovParser: LcovParser;
    private lcovWatcher: FileSystemWatcher;
    private xmlWatcher: FileSystemWatcher;
    private editorWatcher: Disposable;

    private cache: Map<string, Section>;
    private status: Status;

    constructor(configStore: IConfigStore) {
        this.status = Status.initializing;
        this.configStore = configStore;
        this.cache = new Map();
        this.filesLoader = new FilesLoader(configStore);
        this.renderer = new Renderer(configStore);
        this.lcovParser = new LcovParser(configStore);
        this.loadCache();
    }

    public async displayForFile() {
        this.status = Status.rendering;
        const textEditor = window.activeTextEditor;
        this.renderer.renderCoverage(this.cache, [textEditor]);
        this.status = Status.ready;
    }

    public async watchWorkspace() {
        await this.displayForFile();
        this.listenToFileSystem();
        this.listenToEditorEvents();
    }

    public async loadCache() {
        this.status = Status.loading;
        const files = await this.filesLoader.findCoverageFiles();
        const dataFiles = await this.filesLoader.loadDataFiles(files);
        const dataCoverage = await this.lcovParser.filesToSections(dataFiles);
        this.cache = dataCoverage;
        this.status = Status.ready;
    }

    private listenToFileSystem() {
        this.lcovWatcher = workspace.createFileSystemWatcher(
            this.configStore.lcovFileName,
        );
        this.lcovWatcher.onDidChange(this.loadCache);
        this.lcovWatcher.onDidCreate(this.loadCache);
        this.lcovWatcher.onDidDelete(this.loadCache);

        this.xmlWatcher = workspace.createFileSystemWatcher(
            this.configStore.xmlFileName,
        );
        this.xmlWatcher.onDidChange(this.loadCache);
        this.xmlWatcher.onDidCreate(this.loadCache);
        this.xmlWatcher.onDidDelete(this.loadCache);
    }

    private listenToEditorEvents() {
        this.editorWatcher = window.onDidChangeVisibleTextEditors(
            (textEditors) => {
                this.status = Status.rendering;
                this.renderer.renderCoverage(
                    this.cache,
                    textEditors,
                );
                this.status = Status.ready;
            },
        );
    }
}
