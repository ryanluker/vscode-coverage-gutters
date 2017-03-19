"use strict";

import {window, commands, workspace} from "vscode";
import {
    DecorationRenderOptions,
    TextEditorDecorationType,
    WorkspaceConfiguration,
    Range,
    DecorationOptions,
    CancellationToken,
    Uri
} from "vscode"

export function createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType {
    return window.createTextEditorDecorationType(options);
}

export function setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]) {
    return window.activeTextEditor.setDecorations(decorationType, rangesOrOptions);
}

export function executeCommand(command: string, ...rest: any[]): Thenable<{}> {
    return commands.executeCommand(command, rest);
}

export function findFiles(include: string, exclude: string, maxResults?: number, token?: CancellationToken): Thenable<Uri[]> {
    return workspace.findFiles(include, exclude, maxResults, token);
}

export function getConfiguration(section?: string): WorkspaceConfiguration {
    return workspace.getConfiguration(section);
}