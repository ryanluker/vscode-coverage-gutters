import glob from "glob";
import Mocha from "mocha";
import { resolve } from "path";

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        color: true,
        ui: "tdd",
    });

    // Apply regex to run subset of tests (integration vs unit)
    if (process.env.MOCHA_GREP) {
        const grepRE = new RegExp(process.env.MOCHA_GREP);
        mocha.grep(grepRE);
    }

    const testsRoot = resolve(__dirname, "..");
    return new Promise((c, e) => {
        glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
            if (err) {
                return e(err);
            }
            // Add files to the test suite
            files.forEach((f) => mocha.addFile(resolve(testsRoot, f)));
            try {
                // Run the mocha test
                mocha.run((failures) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
