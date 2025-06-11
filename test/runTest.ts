import * as cp from "child_process";
import * as path from "path";
import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests,
} from "@vscode/test-electron";

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, "../../out");
        const extensionTestsPath = path.resolve(__dirname, "index");

        // Add the dependent extension for test coverage preview functionality
        const vscodeExecutablePath = await downloadAndUnzipVSCode("insiders");
        const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        // Use cp.spawn / cp.exec for custom setup
        // Note: shell true is needed to fix an issue with install-extension (on windows)
        // https://github.com/microsoft/vscode-test/issues/266#issuecomment-2085723194
        const output = cp.spawnSync(
            cliPath,
            [...args, "--install-extension", "ms-vscode.live-server"],
            {
                shell: process.platform === 'win32',
                encoding: 'utf-8',
                stdio: 'inherit'
            },
        );

        // Useful for debugging failing dependant extension installs
        console.info(output);

        // Default test options for gutters testing
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["example/example.code-workspace"],
        });

        console.info("Success!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to run tests");
        process.exit(1);
    }
}

main();
