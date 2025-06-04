import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, "../../out");
        const extensionTestsPath = path.resolve(__dirname, "index");

        await runTests({
            version: "insiders",
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["example/example.code-workspace"],
        })

        console.info("Success!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to run tests");
        console.error(err);
        process.exit(1);
    }
}

main();
