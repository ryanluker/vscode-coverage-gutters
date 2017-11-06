import {
    CancellationToken,
    commands,
    DecorationRenderOptions,
    FileSystemWatcher,
    QuickPickItem,
    QuickPickOptions,
    Range,
    TextEditorDecorationType,
    window,
    workspace,
    WorkspaceConfiguration,
    WorkspaceFolder,
} from "vscode";

export interface InterfaceVscode {
    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
    executeCommand(command: string, ...rest: any[]): Thenable<{}>;
    getConfiguration(section?: string): WorkspaceConfiguration;
    getWorkspaceFolders(): WorkspaceFolder[] | undefined;
    watchFile(filePattern: string): FileSystemWatcher;
    showQuickPick<T extends QuickPickItem>(
        items: T[] | Thenable<T[]>,
        options?: QuickPickOptions,
        token?: CancellationToken,
    ): Thenable<T | undefined>;
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

    public getWorkspaceFolders(): WorkspaceFolder[] | undefined {
        return workspace.workspaceFolders;
    }

    public showQuickPick<T extends QuickPickItem>(
        items: T[] | Thenable<T[]>,
        options?: QuickPickOptions,
        token?: CancellationToken,
    ): Thenable<T | undefined> {
        return window.showQuickPick(items, options, token);
    }

    public watchFile(filePattern: string): FileSystemWatcher {
        return workspace.createFileSystemWatcher(filePattern);
    }
}
