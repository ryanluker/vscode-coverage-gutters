import { extensions } from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";

export class CrashReporter {
    private reporter: TelemetryReporter;

    constructor() {
        const extension = extensions.getExtension("ryanluker.vscode-coverage-gutters")!;
        const version = extension?.packageJSON.version;
        const appInsightsKey = "c9a59792-25cc-4128-9c06-a44b9d4a1558";
        this.reporter = new TelemetryReporter(extension.id, version, appInsightsKey);
    }

    public sendEvent(eventName: string): void {
        this.reporter.sendTelemetryEvent(eventName);
    }

    public sendErrorEvent(eventName: string, error: Error): void {
        const params = {
            originalEventName: eventName,
            stackTrace: error.stack ? error.stack : error.message,
        };
        this.reporter.sendTelemetryErrorEvent("ERROR", params);
    }

    public dispose(): void {
        this.reporter.dispose();
    }
}
