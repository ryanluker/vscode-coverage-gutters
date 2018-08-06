import {assert} from "chai";
import {
    areFilesRelativeEquals,
    findIntersect,
    normalizeFileName,
} from "../src/helpers";

suite("helper Tests", function() {
    test("Should normalize filenames properly @unit", function(done) {
        [
            {fileName: "", expected: ""},
            {fileName: "A", expected: "a"},
            {fileName: "/", expected: "###"},
            {fileName: "\\", expected: "###"},
            {fileName: "a\\A", expected: "a###a"},
            {fileName: "a/A", expected: "a###a"},
            {fileName: "a/A/", expected: "a###a###"},
            {fileName: "/###/", expected: "#########"},
            {fileName: "\\/", expected: "######"},
        ].forEach((parameters) => {
            assert.equal(normalizeFileName(parameters.fileName), parameters.expected);
        });
        return done();
    });

    test("Should find intersects between strings @unit", function(done) {
        [
            {base: "", comparee: "", expected: ""},
            {base: "a", comparee: "a", expected: "a"},
            {base: "a", comparee: "b", expected: ""},
            {base: "a", comparee: "ab", expected: ""},
            {base: "a", comparee: "ba", expected: "a"},
            {base: "ba", comparee: "a", expected: "a"},
            {base: "a", comparee: "aa", expected: "a"},
            {base: "ba", comparee: "aa", expected: "a"},
            {base: "ba", comparee: "ba", expected: "ba"},
        ].forEach( (parameters) => {
            const testName = `base = '${parameters.base}'
                and comparee = '${parameters.comparee}' -> '${parameters.expected}'`;
            assert.equal(findIntersect(parameters.base, parameters.comparee), parameters.expected, testName);
        });
        return done();
    });

    test("Should compare relative paths properly @unit", function(done) {
        [
            {
                expected: false,
                file1: "c###dev###python###python###foo###bar###a.py",
                file2: "mnt###c###dev###python###python###foo###bar###_init_.py",
                folder: "python",
            },
            {
                expected: true,
                file1: "c###dev###python###python###foo###bar###a.py",
                file2: "mnt###c###dev###python###python###foo###bar###a.py",
                folder: "python",
            },
        ].forEach( (parameters) => {
            // tslint:disable-next-line:max-line-length
            const testName = `file1 = '${parameters.file1}' and file2 = '${parameters.file2}' and folder = '${parameters.folder}' -> '${parameters.expected}'`;
            const isEqual = areFilesRelativeEquals(parameters.file1, parameters.file2, parameters.folder);
            assert.equal(isEqual, parameters.expected, testName);
        });
        return done();
    });
});
