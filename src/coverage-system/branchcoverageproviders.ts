import * as vscode from "vscode";
import { Section } from "lcov-parse";

/**
 * Manages visual highlighting of LLVM coverage regions
 */
export class RegionHighlighter {
    private regionDecorationType: vscode.TextEditorDecorationType;
    private currentDecorations: Map<vscode.TextEditor, vscode.Range[]> = new Map();

    constructor() {
        this.regionDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.wordHighlightStrongBackground'),
            border: '1px solid',
            borderColor: new vscode.ThemeColor('editor.wordHighlightStrongBorder'),
            overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.wordHighlightStrongForeground'),
            overviewRulerLane: vscode.OverviewRulerLane.Center,
        });
    }

    /**
     * Highlight a specific region range in the editor
     */
    public highlightRegion(editor: vscode.TextEditor, startLine: number, startCol: number, endLine: number, endCol: number) {
        const range = new vscode.Range(
            new vscode.Position(startLine - 1, startCol - 1),
            new vscode.Position(endLine - 1, endCol - 1)
        );
        
        editor.setDecorations(this.regionDecorationType, [range]);
        this.currentDecorations.set(editor, [range]);
    }

    /**
     * Clear all region highlights in the given editor
     */
    public clearHighlights(editor?: vscode.TextEditor) {
        if (editor) {
            editor.setDecorations(this.regionDecorationType, []);
            this.currentDecorations.delete(editor);
        } else {
            // Clear all editors
            for (const ed of this.currentDecorations.keys()) {
                ed.setDecorations(this.regionDecorationType, []);
            }
            this.currentDecorations.clear();
        }
    }

    /**
     * Dispose of decoration type and clear all highlights
     */
    public dispose() {
        this.clearHighlights();
        this.regionDecorationType.dispose();
    }
}

/**
 * Provides CodeLens for branch coverage information on partial coverage lines
 */
export class BranchCoverageCodeLensProvider implements vscode.CodeLensProvider {
    private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;

    private coverageData: Map<string, Section> = new Map();

    public updateCoverageData(coverageData: Map<string, Section>) {
        this.coverageData = coverageData;
        this.onDidChangeCodeLensesEmitter.fire();
    }

    public provideCodeLenses(
        document: vscode.TextDocument
    ): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const filePath = document.uri.fsPath;

        // Find the coverage section that matches this document
        const section = this.findSectionForFile(filePath);
        if (!section || !section.branches) {
            return codeLenses;
        }

        // Get all lines with partial coverage (branches taken === 0)
        const partialLines = new Set<number>();
        section.branches.details
            .filter((detail) => detail.taken === 0 && detail.line > 0)
            .forEach((detail) => {
                partialLines.add(detail.line);
            });

        // Create CodeLens for each partial coverage line
        partialLines.forEach((lineNum) => {
            const range = new vscode.Range(lineNum - 1, 0, lineNum - 1, 100);
            const branchesOnLine = section.branches!.details.filter(
                (detail) => detail.line === lineNum
            );

            const totalBranches = branchesOnLine.length;
            const takenBranches = branchesOnLine.filter(
                (detail) => detail.taken > 0
            ).length;
            const percentage = Math.round((takenBranches / totalBranches) * 100);

            const codeLens = new vscode.CodeLens(
                range,
                {
                    title: `${takenBranches}/${totalBranches} branches taken (${percentage}%)`,
                    tooltip: `Branch coverage: ${takenBranches} out of ${totalBranches} branches executed`,
                    command: "",
                }
            );

            codeLenses.push(codeLens);
        });

        return codeLenses;
    }

    private findSectionForFile(filePath: string): Section | undefined {
        for (const section of this.coverageData.values()) {
            // Normalize paths for comparison
            const normalizedSectionPath = section.file.replace(/\\/g, "/");
            const normalizedFilePath = filePath.replace(/\\/g, "/");

            if (
                normalizedSectionPath === normalizedFilePath ||
                normalizedFilePath.endsWith(normalizedSectionPath) ||
                normalizedSectionPath.endsWith(normalizedFilePath)
            ) {
                return section;
            }
        }
        return undefined;
    }
}

/**
 * Provides hover information for branch coverage details with region highlighting
 */
export class BranchCoverageHoverProvider implements vscode.HoverProvider {
    private coverageData: Map<string, Section> = new Map();
    private regionHighlighter: RegionHighlighter;
    private lastHoverPosition: { line: number; col: number } | undefined;

    constructor(regionHighlighter: RegionHighlighter) {
        this.regionHighlighter = regionHighlighter;
    }

    public updateCoverageData(coverageData: Map<string, Section>) {
        this.coverageData = coverageData;
    }

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {
        const filePath = document.uri.fsPath;
        const lineNum = position.line + 1;
        const colNum = position.character + 1;

        const section = this.findSectionForFile(filePath);
        if (!section) {
            return null;
        }

        const markdownContent = new vscode.MarkdownString();
        let appended = false;

        // Branch coverage (if present)
        if (section.branches && section.branches.details) {
            const branchesOnLine = section.branches.details.filter(
                (detail) => detail.line === lineNum
            );

            if (branchesOnLine.length > 0) {
                const totalBranches = branchesOnLine.length;
                const takenBranches = branchesOnLine.filter(
                    (detail) => detail.taken > 0
                ).length;
                const percentage = Math.round((takenBranches / totalBranches) * 100);
                markdownContent.appendMarkdown(
                    `**Branch Coverage:** ${takenBranches}/${totalBranches} branches taken (${percentage}%)\n\n`
                );

                const notTakenBranches = branchesOnLine.filter((detail) => detail.taken === 0);
                if (notTakenBranches.length > 0) {
                    // Prefer Cobertura condition details when available
                    type SectionWithCobertura = Section & {
                        __coberturaConditionsByLine?: Record<number, { coveragePercent: number; edgesCovered: number; edgesTotal: number; conditions: Array<{ number: number; type: string; coveragePercent: number }> }>;
                    };
                    const cobSection = section as SectionWithCobertura;
                    const condInfo = cobSection.__coberturaConditionsByLine?.[lineNum];

                    markdownContent.appendMarkdown("**Branches not executed:**\n\n");
                    if (condInfo) {
                        // Show precise condition coverage context from Cobertura
                        const missingEdges = Math.max(0, condInfo.edgesTotal - condInfo.edgesCovered);
                        markdownContent.appendMarkdown(
                            `- Condition coverage: ${condInfo.coveragePercent}% (${condInfo.edgesCovered}/${condInfo.edgesTotal})\n`
                        );
                        if (missingEdges > 0) {
                            markdownContent.appendMarkdown(
                                `- Missing edges: ${missingEdges} (short-circuited or untested paths)\n`
                            );
                        }
                        if (condInfo.conditions && condInfo.conditions.length) {
                            markdownContent.appendMarkdown("- Per-condition details:\n");
                            condInfo.conditions.forEach((c) => {
                                markdownContent.appendMarkdown(
                                    `  • condition #${c.number} (${c.type}): ${c.coveragePercent}%\n`
                                );
                            });
                        }
                    } else {
                        // Fallback: do not display undefined block, show branch id only
                        notTakenBranches.forEach((branch) => {
                            const branchId = (branch as { branch?: number }).branch;
                            markdownContent.appendMarkdown(
                                `- Branch ${branchId ?? "(unknown)"} not executed\n`
                            );
                        });
                    }

                    // If missing_branches metadata exists, surface line numbers
                    if (notTakenBranches[0].missing_branches) {
                        const missingLines = new Set<number>();
                        notTakenBranches.forEach((branch) => {
                            branch.missing_branches?.forEach((line) => missingLines.add(line));
                        });
                        const sorted = Array.from(missingLines).sort((a, b) => a - b);
                        if (sorted.length) {
                            markdownContent.appendMarkdown("\n**Missing branch lines:** ");
                            markdownContent.appendMarkdown(sorted.join(", "));
                            markdownContent.appendMarkdown("\n");
                        }
                    }

                    markdownContent.appendMarkdown("\n");
                }
                appended = true;
            }
        }

        // LLVM region-wise counts (if available)
        type SectionWithSegments = Section & {
            __llvmSegmentsByLine?: Record<number, Array<{ col: number; count: number; hasCount: boolean; isRegionEntry: boolean; isGapRegion: boolean }>>;
        };
        const sectionWithSegments = section as SectionWithSegments;
        const llvmSegmentsByLine = sectionWithSegments.__llvmSegmentsByLine;

        const segments = llvmSegmentsByLine?.[lineNum] || [];
        const regionEntries = segments.filter(s => s.hasCount && s.isRegionEntry);
        if (regionEntries.length > 0) {
            markdownContent.appendMarkdown("**Region Counts (LLVM):**\n\n");
            // Sort by column for stable display
            regionEntries.sort((a, b) => a.col - b.col);
            
            // Find the region entry closest to the cursor position
            let closestRegion = regionEntries[0];
            let minDistance = Math.abs(closestRegion.col - colNum);
            for (const seg of regionEntries) {
                const distance = Math.abs(seg.col - colNum);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestRegion = seg;
                }
            }
            
            // Highlight the region for the closest region entry
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri.fsPath === filePath) {
                // Find the end of this region by looking for the next segment
                const allSegmentsOnLine = segments.sort((a, b) => a.col - b.col);
                const regionIndex = allSegmentsOnLine.findIndex(s => s.col === closestRegion.col);
                const endLine = lineNum;
                let endCol = closestRegion.col + 50; // Default end if not found
                
                if (regionIndex < allSegmentsOnLine.length - 1) {
                    // End at the next segment on same line
                    endCol = allSegmentsOnLine[regionIndex + 1].col;
                } else {
                    // Use line end
                    endCol = document.lineAt(lineNum - 1).text.length + 1;
                }
                
                this.regionHighlighter.highlightRegion(editor, lineNum, closestRegion.col, endLine, endCol);
            }
            
            // Display only the closest region
            const label = closestRegion.isGapRegion ? "gap" : "code";
            markdownContent.appendMarkdown(`**${closestRegion.count}** executions (${label})\n`);
            appended = true;
        } else {
            // Clear highlights if no regions on this line
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this.regionHighlighter.clearHighlights(editor);
            }
        }

        if (!appended) {
            return null;
        }
        return new vscode.Hover(markdownContent);
    }

    private findSectionForFile(filePath: string): Section | undefined {
        for (const section of this.coverageData.values()) {
            // Normalize paths for comparison
            const normalizedSectionPath = section.file.replace(/\\/g, "/");
            const normalizedFilePath = filePath.replace(/\\/g, "/");

            if (
                normalizedSectionPath === normalizedFilePath ||
                normalizedFilePath.endsWith(normalizedSectionPath) ||
                normalizedSectionPath.endsWith(normalizedFilePath)
            ) {
                return section;
            }
        }
        return undefined;
    }
}
