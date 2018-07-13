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
import {Reporter} from "./reporter";

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
    private eventReporter: Reporter;
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
        eventReporter: Reporter,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
        this.updateServiceState(Status.initializing);
        this.cache = new Map();
        this.filesLoader = new FilesLoader(configStore);
        this.renderer = new Renderer(
            configStore,
        );
        this.lcovParser = new LcovParser(configStore);
    }

    public dispose() {
        this.xmlWatcher.dispose();
        this.editorWatcher.dispose();
        this.cache = new Map(); // reset cache to empty
        const visibleEditors = window.visibleTextEditors;
        this.renderer.renderCoverage(this.cache, visibleEditors);
    }

    public async displayForFile() {
        await this.loadCacheAndRender();
    }

    public async watchWorkspace() {
        await this.displayForFile();
        this.listenToFileSystem();
        this.listenToEditorEvents();
    }

    public async removeCoverageForCurrentEditor() {
        const visibleEditors = window.visibleTextEditors;
        await this.renderer.renderCoverage(new Map(), visibleEditors);
    }

    private async loadCache() {
        try {
            this.updateServiceState(Status.loading);
            const files = await this.filesLoader.findCoverageFiles();
            this.outputChannel.appendLine(
                `[${Date.now()}][coverageservice]: Loading ${files.size} file(s)`);
            const dataFiles = await this.filesLoader.loadDataFiles(files);
            const dataCoverage = await this.lcovParser.filesToSections(dataFiles);
            this.outputChannel.appendLine(
                `[${Date.now()}][coverageservice]: Caching ${dataCoverage.size} coverage(s)`);
            this.cache = dataCoverage;
            this.updateServiceState(Status.ready);
        } catch (error) {
            this.handleError(error);
        }
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
        this.updateServiceState(Status.ready);
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

    private handleError(error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        window.showWarningMessage(message.toString());
        this.outputChannel.appendLine(`[${Date.now()}][gutters]: Error ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][gutters]: Stacktrace ${stackTrace}`);
        this.eventReporter.sendEvent(
            "error",
            message.toString(),
            stackTrace ? stackTrace.toString() : undefined,
        );
    }
}
