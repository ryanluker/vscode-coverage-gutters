import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests,
} from "@vscode/test-electron";
import * as cp from "child_process";
import * as path from "path";

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, "..", "..");
        const extensionTestsPath = path.resolve(__dirname, "index");
        const vscodeExecutablePath = await downloadAndUnzipVSCode("insiders");

        // Add the dependent extension for test coverage preview functionality
        const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
        cp.spawnSync(cli, [...args, "--install-extension", "ms-vscode.live-server"], {
          encoding: "utf-8",
          stdio: "inherit",
        });

        await runTests({
          extensionDevelopmentPath,
          extensionTestsPath,
          launchArgs: ["example/example.code-workspace"],
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
