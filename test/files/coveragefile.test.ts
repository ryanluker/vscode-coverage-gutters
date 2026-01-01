import { expect } from "chai";
import {CoverageFile, CoverageType} from "../../src/files/coveragefile";

suite("Coverage File Tests", function() {
    test("Returns the correct file type for a file @unit", function() {
        const fakeLcovInfo = `
            TN:
            SF:./ryanluker/dev/vscode-coverage-gutters/example/node/test.js
            FN:6,(anonymous_1)
            FN:7,(anonymous_2)
            FN:12,(anonymous_3)
            FN:17,(anonymous_4)
            FN:22,(anonymous_5)
            FN:27,(anonymous_6)
            FN:32,(anonymous_7)
            FNF:7
            FNH:7
        `;
        const coverageFile = new CoverageFile(fakeLcovInfo);
        expect(coverageFile.type).to.equal(CoverageType.LCOV);
    });

    test("Ignores empty file (#150) @unit", function() {
        const coverageFile = new CoverageFile("");
        expect(coverageFile.type).to.equal(CoverageType.NONE);
    });

    test("Detects LLVM_COV_JSON format @unit", function() {
        const llvmJsonContent = `{
  "version": "2.0.0",
  "type": "llvm.coverage.json.export",
  "data": [
    {
      "files": [
        {
          "filename": "test.cpp",
          "segments": [
            {"line": 10, "col": 1, "count": 5, "hasCount": true, "isRegionEntry": true}
          ],
          "branches": [
            {"lineNumber": 10, "count": [5, 0]}
          ]
        }
      ]
    }
  ]
}`;
        const coverageFile = new CoverageFile(llvmJsonContent);
        expect(coverageFile.type).to.equal(CoverageType.LLVM_COV_JSON);
    });

    test("Still detects CLOVER format correctly @unit", function() {
        const cloverContent = `<?xml version="1.0" encoding="UTF-8"?>
<coverage version="1.0">
  <project>
    <package>
      <class/>
    </package>
  </project>
</coverage>`;
        const coverageFile = new CoverageFile(cloverContent);
        expect(coverageFile.type).to.equal(CoverageType.CLOVER);
    });

    test("Still detects JACOCO format correctly @unit", function() {
        const jacocoContent = `<?xml version="1.0" encoding="UTF-8"?>
<report name="JACOCO">
  <counter type="INSTRUCTION" missed="0" covered="10"/>
</report>`;
        const coverageFile = new CoverageFile(jacocoContent);
        expect(coverageFile.type).to.equal(CoverageType.JACOCO);
    });
});

