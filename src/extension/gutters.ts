import { commands, extensions, window, OutputChannel } from "vscode";
import { Section } from "lcov-parse";
import { Coverage } from "../coverage-system/coverage";
import { CoverageService } from "../coverage-system/coverageservice";
import { Config } from "./config";
import { StatusBarToggler } from "./statusbartoggler";

interface BranchCoverageProvider {
    updateCoverageData(data: Map<string, Section>): void;
}

export const PREVIEW_COMMAND = "livePreview.start.internalPreview.atFile";

export class Gutters {
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;
    private branchCodeLensProvider: BranchCoverageProvider | undefined;
    private branchHoverProvider: BranchCoverageProvider | undefined;

    constructor(
        configStore: Config,
        coverage: Coverage,
        outputChannel: OutputChannel,
        statusBar: StatusBarToggler,
    ) {
        this.coverage = coverage;
        this.outputChannel = outputChannel;
        this.statusBar = statusBar;
        this.coverageService = new CoverageService(
            configStore,
            this.outputChannel,
            statusBar,
        );
    }

    public setProviders(codeLensProvider: BranchCoverageProvider, hoverProvider: BranchCoverageProvider) {
        this.branchCodeLensProvider = codeLensProvider;
        this.branchHoverProvider = hoverProvider;
        this.coverageService.setProviders(codeLensProvider, hoverProvider);
    }

    public async previewCoverageReport() {
        try {
            const livePreview = this.getLiveServerExtension();
            if (!livePreview) {
                await window.showErrorMessage("Live Preview extension not installed", {
                    modal: true,
                    detail: "The ms-vscode.live-server extension must be installed to preview the coverage report."
                }, "Ok");
                return;
            }

            const coverageReports = await this.coverage.findReports();
            const pickedReport = await this.coverage.pickFile(
                coverageReports,
                "Choose a Coverage Report to preview.",
            );
            if (!pickedReport) {
                window.showWarningMessage("Could not show Coverage Report file!");
                return;
            }

            // is the ext loaded and ready?
            if (livePreview.isActive === false) {
                await livePreview.activate();
            }

            // TODO:  Figure out how to convert pickedReport to a workspace relative filename.
            // Right now the livePreview.start.internalPreview.atFile is called with "false" as
            // the second parameter.  This means that the file specified has an absolute path.
            // See the Live Preview extension source code:
            // https://github.com/microsoft/vscode-livepreview/blob/
            // 3be1e2eb5c8a7b51aa4a88275ad73bb4d923432b/src/extension.ts#L169
            await commands.executeCommand(PREVIEW_COMMAND, pickedReport, false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("previewCoverageReport", error);
        }
    }

    public async displayCoverageForActiveFile() {
        try {
            await this.coverageService.displayForFile();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("displayCoverageForActiveFile", error);
        }
    }

    public async toggleCoverageForActiveFile() {
        try {
            await this.coverageService.toggleCoverage();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("toggleCoverageForActiveFile", error);
        }
    }

    public async watchCoverageAndVisibleEditors() {
        try {
            this.statusBar.toggle(true);
            await this.coverageService.watchWorkspace();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("watchCoverageAndVisibleEditors", error);
        }
    }

    public removeWatch() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
            this.statusBar.toggle(false);
            this.coverageService.dispose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("removeWatch", error);
        }
    }

    public removeCoverageForActiveFile() {
        try {
            this.coverageService.removeCoverageForCurrentEditor();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("removeCoverageForActiveFile", error);
        }
    }

    public dispose() {
        try {
            this.coverageService.dispose();
            this.statusBar.dispose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this.handleError("dispose", error);
        }
    }

    getLiveServerExtension() {
        return extensions.getExtension("ms-vscode.live-server");
    }

    private handleError(area: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${stackTrace}`);
    }
}
