import TelemetryReporter from "vscode-extension-telemetry";

export class CrashReporter {
    private reporter: TelemetryReporter;

    constructor() {
        this.reporter = new TelemetryReporter(
            "vscode-coverage-gutters",
            "2.9.0",
            "c9a59792-25cc-4128-9c06-a44b9d4a1558",
        );
    }

    public captureError(error: Error): void {
        this.reporter.sendTelemetryException(error);
    }

    public dispose(): void {
        this.reporter.dispose();
    }
}
