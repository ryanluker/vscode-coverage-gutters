import * as Sentry from "@sentry/node";
import { v4 as uuidv4 } from "uuid";
import {
    workspace,
} from "vscode";

export class CrashReporter {
    private enableCrashReporting: boolean | undefined;

    constructor() {
        const telemetry = workspace.getConfiguration("telemetry");
        this.enableCrashReporting = telemetry.get("enableCrashReporter");

        if (this.enableCrashReporting) {
            // Leaving default integrations on captures crashes from other extension hosts
            // Turning this off fixes that issue and still allows us to capture errors manually
            Sentry.init({
                defaultIntegrations: false,
                dsn: "https://dfd1a0d586284b6b8710feef8a2928b3@o412074.ingest.sentry.io/5288283",
                release: "vscode-coverage-gutters@2.7.4",
            });
            Sentry.configureScope(function(scope) {
                // Generate a random string for this session
                // Note: for privacy reason, we cannot fingerprint across sessions
                scope.setUser({id: uuidv4()});
            });
        }
    }

    public captureError(error: Error): string[] {
        const sentryId = Sentry.captureException(error);
        const sentryPrompt = "Please post this in the github issue if you submit one. Sentry Event ID:";
        return [sentryId, sentryPrompt];
    }

    public checkEnabled(): boolean | undefined {
        return this.enableCrashReporting;
    }
}
