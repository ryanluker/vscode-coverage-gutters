import {Section} from "lcov-parse";
import {
    Disposable,
    FileSystemWatcher,
    OutputChannel,
    TextEditor,
    window,
    workspace,
} from "vscode";

import {IConfigStore} from "./config";
import {FilesLoader} from "./filesloader";
import {LcovParser} from "./lcovparser";
import {Renderer} from "./renderer";

enum Status {
    ready = "READY",
    initializing = "INITIALIZING",
    loading = "LOADING",
    rendering = "RENDERING",
    error = "ERROR",
}

export class CoverageService {
    private configStore: IConfigStore;
    private outputChannel: OutputChannel;
    private filesLoader: FilesLoader;
    private renderer: Renderer;
    private lcovParser: LcovParser;
    private lcovWatcher: FileSystemWatcher;
    private xmlWatcher: FileSystemWatcher;
    private editorWatcher: Disposable;

    private cache: Map<string, Section>;
    private status: Status;

    constructor(
        configStore: IConfigStore,
        outputChannel: OutputChannel,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.updateServiceState(Status.initializing);
        this.cache = new Map();
        this.filesLoader = new FilesLoader(configStore);
        this.renderer = new Renderer(configStore);
        this.lcovParser = new LcovParser(configStore);
        this.loadCache();
    }

    public async displayForFile() {
        this.updateServiceState(Status.rendering);
        const textEditor = window.activeTextEditor;
        await this.renderer.renderCoverage(this.cache, [textEditor]);
        this.updateServiceState(Status.ready);
    }

    public async watchWorkspace() {
        await this.displayForFile();
        this.listenToFileSystem();
        this.listenToEditorEvents();
    }

    public async loadCache() {
        this.updateServiceState(Status.loading);
        const files = await this.filesLoader.findCoverageFiles();
        const dataFiles = await this.filesLoader.loadDataFiles(files);
        const dataCoverage = await this.lcovParser.filesToSections(dataFiles);
        this.cache = dataCoverage;
        this.updateServiceState(Status.ready);
    }

    private updateServiceState(state: Status) {
        this.status = state;
        this.outputChannel.appendLine(
            `[${Date.now()}][coverageservice]: ${state}`);
    }

    private async loadCacheAndRender() {
        await this.loadCache();
        this.updateServiceState(Status.rendering);
        const visibleEditors = window.visibleTextEditors;
        await this.renderer.renderCoverage(this.cache, visibleEditors);
    }

    private listenToFileSystem() {
        this.lcovWatcher = workspace.createFileSystemWatcher(
            `**/${this.configStore.lcovFileName}`,
        );
        this.lcovWatcher.onDidChange(this.loadCacheAndRender.bind(this));
        this.lcovWatcher.onDidCreate(this.loadCacheAndRender.bind(this));
        this.lcovWatcher.onDidDelete(this.loadCacheAndRender.bind(this));

        this.xmlWatcher = workspace.createFileSystemWatcher(
            `**/${this.configStore.xmlFileName}`,
        );
        this.xmlWatcher.onDidChange(this.loadCacheAndRender.bind(this));
        this.xmlWatcher.onDidCreate(this.loadCacheAndRender.bind(this));
        this.xmlWatcher.onDidDelete(this.loadCacheAndRender.bind(this));
    }

    private async handleEditorEvents(textEditors: TextEditor[]) {
        this.updateServiceState(Status.rendering);
        await this.renderer.renderCoverage(
            this.cache,
            textEditors,
        );
        this.updateServiceState(Status.ready);
    }

    private listenToEditorEvents() {
        this.editorWatcher = window.onDidChangeVisibleTextEditors(
            this.handleEditorEvents.bind(this),
        );
    }
}
