import {assert} from "chai";
import {normalizeFileName} from "../src/helpers";

suite("Normailze File Name Tests", function() {

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
    ].forEach( (parameters) => {
        test(`'${parameters.fileName}' -> '${parameters.expected}' @unit`, (done) => {
            assert.equal(normalizeFileName(parameters.fileName), parameters.expected);
            return done();
        });
    });

});
