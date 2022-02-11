import * as path from "path";

import { downloadAndUnzipVSCode, runTests } from "@vscode/test-electron";

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, "..", "..");
        const extensionTestsPath = path.resolve(__dirname, "index");
        const vscodeExecutablePath = await downloadAndUnzipVSCode("insiders");

        await runTests({
          extensionDevelopmentPath,
          extensionTestsPath,
          launchArgs: [
            "example/example.code-workspace",
            "--disable-extensions",
            "--disable-telemetry",
          ],
          vscodeExecutablePath,
        });

        console.info("Success!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to run tests");
        process.exit(1);
    }
}

main();
