import * as Sentry from "@sentry/node";
import { v4 as uuidv4 } from "uuid";
import {
    workspace,
} from "vscode";

export class CrashReporter {
    private enableCrashReporting: any;

    constructor(
        enableCrashReporting: boolean,
    ) {
        this.enableCrashReporting = enableCrashReporting;
    }

    public captureError(area: string, error: Error) {
        this.checkCrashReporterEnabled();
        let sentryId = "";

        if (this.enableCrashReporting) {
            sentryId = Sentry.captureException(error);
        }

        return sentryId;
    }

    public manualCapture() {
        this.checkCrashReporterEnabled();

        if (this.enableCrashReporting) {
            // Leaving default integrations on captures crashes from other extension hosts
            // Turning this off fixes that issue and still allows us to capture errors manually
            Sentry.init({
                defaultIntegrations: false,
                dsn: "https://dfd1a0d586284b6b8710feef8a2928b3@o412074.ingest.sentry.io/5288283",
                release: "vscode-coverage-gutters@2.7.0-alpha",
            });
            Sentry.configureScope(function(scope) {
                // Generate a random string for this session
                // Note: for privacy reason, we cannot fingerprint across sessions
                scope.setUser({id: uuidv4()});
            });
        }
    }

    private checkCrashReporterEnabled() {
        const telemetry = workspace.getConfiguration("telemetry");
        this.enableCrashReporting = telemetry.get("enableCrashReporter");
    }
}
