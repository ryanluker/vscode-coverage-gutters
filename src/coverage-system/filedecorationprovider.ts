import { basename } from "path";
import * as vscode from "vscode";
import { Section } from "lcov-parse";
import { Config } from "../extension/config";
import { isPathAbsolute, makePathSearchable, normalizeFileName } from "../helpers";

export interface CoverageDataConsumer {
    updateCoverageData(data: Map<string, Section>): void;
}

export class CoverageFileDecorationProvider implements vscode.FileDecorationProvider, CoverageDataConsumer {
    private coverageData: Map<string, Section> = new Map();
    private readonly config: Config;
    private readonly onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    private readonly outputChannel?: vscode.OutputChannel;
    private readonly configListener: vscode.Disposable;

    constructor(config: Config, outputChannel?: vscode.OutputChannel) {
        this.config = config;
        this.outputChannel = outputChannel;
        this.configListener = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("coverage-gutters.showExplorerCoverage")) {
                this.onDidChangeEmitter.fire(undefined);
            }
        });
    }

    public dispose(): void {
        this.configListener.dispose();
    }

    public readonly onDidChangeFileDecorations = this.onDidChangeEmitter.event;

    public updateCoverageData(data: Map<string, Section>): void {
        this.coverageData = data;
        if (this.outputChannel) {
            this.outputChannel.appendLine(
                `[${Date.now()}][filedecorationprovider]: Updated with ${data.size} coverage section(s)`,
            );
        }
        this.onDidChangeEmitter.fire(undefined);
    }

    public provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        if (!this.config.showExplorerCoverage) {
            return;
        }
        const section = this.findSectionForUri(uri);
        if (!section || !section.lines || !section.lines.found) {
            return;
        }

        const percent = Math.floor((section.lines.hit / section.lines.found) * 100);
        if (!Number.isFinite(percent)) {
            return;
        }

        const badge = percent > 99 ? "99" : percent.toString();
        const tooltip = `Coverage: ${percent}% (lines)`;

        if (this.outputChannel) {
            this.outputChannel.appendLine(
                `[${Date.now()}][filedecorationprovider]: Decoration for ${uri.fsPath}: ${percent}%`,
            );
        }

        const color = this.getColorForPercent(percent);
        const decoration = new vscode.FileDecoration(badge, tooltip, color);
        return decoration;
    }

    private getColorForPercent(percent: number): vscode.ThemeColor {
        if (percent >= 80) {
            return new vscode.ThemeColor("charts.green");
        }
        if (percent >= 50) {
            return new vscode.ThemeColor("charts.yellow");
        }
        return new vscode.ThemeColor("charts.red");
    }

    private findSectionForUri(uri: vscode.Uri): Section | undefined {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (!workspaceFolder) { return; }

        const workspaceFsPath = workspaceFolder.uri.fsPath;
        const editorFileAbs = normalizeFileName(uri.fsPath);
        const workspaceFile = normalizeFileName(workspaceFsPath);
        const editorFileRelative = editorFileAbs.substring(workspaceFile.length);
        const workspaceFolderName = normalizeFileName(basename(workspaceFsPath));

        for (const section of this.coverageData.values()) {
            const resolvedFileName = this.resolveFileName(section.file);
            if (!isPathAbsolute(resolvedFileName)) {
                if (this.checkSectionRelative(resolvedFileName, editorFileRelative)) {
                    return section;
                }
            } else if (this.checkSectionAbsolute(resolvedFileName, editorFileRelative, workspaceFolderName)) {
                return section;
            }
        }
        return;
    }

    private resolveFileName(fileName: string): string {
        let potential = fileName;
        const remoteLocalPaths = this.config.remotePathResolve;
        if (remoteLocalPaths && remoteLocalPaths.length === 2) {
            const [remoteFragment, localFragment] = remoteLocalPaths;
            if (fileName.startsWith(remoteFragment)) {
                potential = `${localFragment}${fileName.substring(remoteFragment.length)}`;
            }
        }
        return potential;
    }

    private checkSectionRelative(sectionFileName: string, editorFileRelative: string): boolean {
        const searchable = makePathSearchable(sectionFileName);
        const sectionFileNormalized = normalizeFileName(searchable);
        return editorFileRelative.endsWith(sectionFileNormalized);
    }

    private checkSectionAbsolute(
        sectionFileName: string,
        editorFileRelative: string,
        workspaceFolderName: string,
    ): boolean {
        const sectionFileNormalized = normalizeFileName(sectionFileName);
        const matchPattern = `###${workspaceFolderName}${editorFileRelative}`;
        return sectionFileNormalized.endsWith(matchPattern);
    }
}
