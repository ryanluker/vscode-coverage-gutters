import path from "path";
import fs from "fs";

const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8")
);

// Remove type: "module" to ensure test output uses CommonJS
delete packageJson.type;

const testPackageJsonPath = path.resolve(__dirname, "..", "package.json");
const testPackageJsonContents = JSON.stringify(
    { ...packageJson, main: "./src/extension" },
    null,
    2
);

fs.writeFileSync(testPackageJsonPath, testPackageJsonContents, "utf-8");
