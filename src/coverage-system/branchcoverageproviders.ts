import * as vscode from "vscode";
import { Section } from "lcov-parse";

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
 * Provides hover information for branch coverage details
 */
export class BranchCoverageHoverProvider implements vscode.HoverProvider {
    private coverageData: Map<string, Section> = new Map();

    public updateCoverageData(coverageData: Map<string, Section>) {
        this.coverageData = coverageData;
    }

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {
        const filePath = document.uri.fsPath;
        const lineNum = position.line + 1;

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
                    markdownContent.appendMarkdown("**Branches not executed:**\n\n");
                    notTakenBranches.forEach((branch) => {
                        markdownContent.appendMarkdown(
                            `- Block: ${branch.block}, Branch: ${branch.branch}\n`
                        );
                    });

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

                    // Show condition coverage percentage when present
                    const withCondition = notTakenBranches.find((b) => {
                        const branchWithCondition = b as { condition_coverage?: number };
                        return branchWithCondition.condition_coverage !== undefined;
                    });
                    if (withCondition) {
                        const branchWithCondition = withCondition as { condition_coverage?: number };
                        if (branchWithCondition.condition_coverage !== undefined) {
                            markdownContent.appendMarkdown(
                                `\n**Condition Coverage:** ${branchWithCondition.condition_coverage}%\n`
                            );
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
            regionEntries.forEach((seg) => {
                const label = seg.isGapRegion ? "gap" : "code";
                markdownContent.appendMarkdown(`- col ${seg.col}: ${seg.count} (${label})\n`);
            });
            appended = true;
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
