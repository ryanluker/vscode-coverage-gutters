import { commands, extensions } from "vscode";
import { OutputChannel, window } from "vscode";
import { Coverage } from "../coverage-system/coverage";
import { CoverageService } from "../coverage-system/coverageservice";
import { Config } from "./config";
import { StatusBarToggler } from "./statusbartoggler";

export class Gutters {
    private coverage: Coverage;
    private outputChannel: OutputChannel;
    private statusBar: StatusBarToggler;
    private coverageService: CoverageService;

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

    public async previewCoverageReport() {
        try {
            const coverageReports = await this.coverage.findReports();
            const pickedReport = await this.coverage.pickFile(
                coverageReports,
                "Choose a Coverage Report to preview.",
            );
            if (!pickedReport) {
                window.showWarningMessage("Could not show Coverage Report file!");
                return;
            }

            // TODO:  Figure out how to convert pickedReport to a workspace relative filename.
            // Right now the livePreview.start.internalPreview.atFile is called with "false" as
            // the second parameter.  This means that the file specified has an absolute path.
            // See the Live Preview extension source code:
            // https://github.com/microsoft/vscode-livepreview/blob/
            // 3be1e2eb5c8a7b51aa4a88275ad73bb4d923432b/src/extension.ts#L169
            const livePreview = extensions.getExtension("ms-vscode.live-server");
            // is the ext loaded and ready?
            if (livePreview?.isActive === false) {
                livePreview.activate().then(
                    function() {
                        console.log("Extension activated");
                        commands.executeCommand("livePreview.start.internalPreview.atFile", pickedReport, false);
                    },
                    function() {
                        console.log("Extension activation failed");
                    },
                );
            } else {
                commands.executeCommand("livePreview.start.internalPreview.atFile", pickedReport, false);
            }

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

    private handleError(area: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${message}`);
        this.outputChannel.appendLine(`[${Date.now()}][${area}]: ${stackTrace}`);
    }
}
