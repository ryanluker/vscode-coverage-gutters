import {
    CancellationToken,
    commands,
    DecorationOptions,
    DecorationRenderOptions,
    Range,
    TextEditorDecorationType,
    Uri,
    window,
    workspace,
    WorkspaceConfiguration,
} from "vscode";

export interface InterfaceVscode {
    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
    setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]): void;
    executeCommand(command: string, ...rest: any[]): Thenable<{}>;
    findFiles(include: string, exclude: string, maxResults?: number, token?: CancellationToken): Thenable<Uri[]>;
    getConfiguration(section?: string): WorkspaceConfiguration;
    getRootPath(): string;
}

export class Vscode implements InterfaceVscode {
    public createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType {
        return window.createTextEditorDecorationType(options);
    }

    public setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]) {
        return window.activeTextEditor.setDecorations(decorationType, rangesOrOptions);
    }

    public executeCommand(command: string, ...rest: any[]): Thenable<{}> {
        return commands.executeCommand(command, rest);
    }

    public findFiles(
        include: string,
        exclude: string, maxResults?: number,
        token?: CancellationToken,
    ): Thenable<Uri[]> {
        return workspace.findFiles(include, exclude, maxResults, token);
    }

    public getConfiguration(section?: string): WorkspaceConfiguration {
        return workspace.getConfiguration(section);
    }

    public getRootPath(): string {
        return workspace.rootPath;
    }
}
