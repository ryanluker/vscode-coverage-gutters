import {resolve} from "path";

import { downloadAndUnzipVSCode, runTests } from "vscode-test";

async function main() {
    try {
        const extensionDevelopmentPath = resolve(__dirname, "..", "..");

        const extensionTestsPath = resolve(__dirname, "index");

        const vscodeExecutablePath = await downloadAndUnzipVSCode("insiders");

        await runTests({
          extensionDevelopmentPath,
          extensionTestsPath,
          launchArgs: [
            "example/example.code-workspace",
            "--disable-extensions",
          ],
          vscodeExecutablePath,
        });
    } catch (err) {
        console.error("Failed to run tests");
        process.exit(1);
    }
}

main();
