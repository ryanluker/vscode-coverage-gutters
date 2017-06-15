import {
    CancellationToken,
    commands,
    DecorationRenderOptions,
    FileSystemWatcher,
    Range,
    TextEditorDecorationType,
    window,
    workspace,
    WorkspaceConfiguration,
} from "vscode";

export interface InterfaceVscode {
    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
    executeCommand(command: string, ...rest: any[]): Thenable<{}>;
    getConfiguration(section?: string): WorkspaceConfiguration;
    getRootPath(): string;
    watchFile(filePattern: string): FileSystemWatcher;
}

export class Vscode implements InterfaceVscode {
    public createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType {
        return window.createTextEditorDecorationType(options);
    }

    public executeCommand(command: string, ...rest: any[]): Thenable<{}> {
        return commands.executeCommand(command, rest);
    }

    public getConfiguration(section?: string): WorkspaceConfiguration {
        return workspace.getConfiguration(section);
    }

    public getRootPath(): string {
        return workspace.rootPath;
    }

    public watchFile(filePattern: string): FileSystemWatcher {
        return workspace.createFileSystemWatcher(filePattern);
    }
}
