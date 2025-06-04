import * as path from "path";
import {
    runTests,
    runVSCodeCommand,
} from "@vscode/test-electron";

async function main() {
    try {
        const vscodeVersion = "insiders";
        const extensionDevelopmentPath = path.resolve(__dirname, "../../");
        const extensionTestsPath = path.resolve(__dirname, "index");

        // Ensure live-server is not installed
        await runVSCodeCommand(
            ["--uninstall-extension", "ms-vscode.live-server"],
            { version: vscodeVersion, extensionDevelopmentPath }
        ).catch(() => {
            // Ignore, this will happen when first setting up an environment
            // or when the test process dies when running tests without the
            // optional dependency installed.
        });

        // Run tests without live server installed
        await runTests({
            version: vscodeVersion,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["example/example.code-workspace"],
            extensionTestsEnv: {
                TEST_FILTER: "no-live-server"
            }
        })

        await runVSCodeCommand(
            ["--install-extension", "ms-vscode.live-server"],
            { version: vscodeVersion, extensionDevelopmentPath }
        );

        // Default test options for gutters testing
        await runTests({
            version: vscodeVersion,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["example/example.code-workspace"],
            extensionTestsEnv: {
                TEST_FILTER: "live-server"
            }
        });

        console.info("Success!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to run tests");
        console.error(err);
        process.exit(1);
    }
}

main();
