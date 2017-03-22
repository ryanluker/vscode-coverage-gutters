"use strict";

import {
    window,
    commands,
    workspace,
    DecorationRenderOptions,
    TextEditorDecorationType,
    WorkspaceConfiguration,
    Range,
    DecorationOptions,
    CancellationToken,
    Uri
} from "vscode"

export interface VscodeInterface {
    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
    setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]): void;
    executeCommand(command: string, ...rest: any[]): Thenable<{}>;
    findFiles(include: string, exclude: string, maxResults?: number, token?: CancellationToken): Thenable<Uri[]>;
    getConfiguration(section?: string): WorkspaceConfiguration;
}

export class vscode implements VscodeInterface {
    public createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType {
        return window.createTextEditorDecorationType(options);
    }

    public setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]) {
        return window.activeTextEditor.setDecorations(decorationType, rangesOrOptions);
    }

    public executeCommand(command: string, ...rest: any[]): Thenable<{}> {
        return commands.executeCommand(command, rest);
    }

    public findFiles(include: string, exclude: string, maxResults?: number, token?: CancellationToken): Thenable<Uri[]> {
        return workspace.findFiles(include, exclude, maxResults, token);
    }

    public getConfiguration(section?: string): WorkspaceConfiguration {
        return workspace.getConfiguration(section);
    }
}
