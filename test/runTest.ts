import * as path from "path";
import { runTests } from "@vscode/test-electron";
    
let retries = 0;
const maxRetries = 3;
async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, "../../out");
        const extensionTestsPath = path.resolve(__dirname, "index");

        // Add chrome flags to improve stability on CI (especially Windows/macOS) and keep
        // the workspace launch arg last.
        const launchArgs = [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-features=CalculateNativeWinOcclusion",
            "example/example.code-workspace",
        ];

        await runTests({
            version: "insiders",
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs,
        })

        console.info("Success!");
        process.exit(0);
    } catch (err) {
        if (retries <= maxRetries) {
            // Provide a small wait between failure runs
            console.info(`Error on run ${retries} with ${err}`);
            setTimeout(() => {
                retries++;
                main();
            }, 1000);
        } else {
            console.error("Failed to run tests");
            console.error(err);
            process.exit(1);
        }
    }
}

main();
