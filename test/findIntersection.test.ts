import {assert} from "chai";
import {findIntersect} from "../src/helpers";

suite("Find Intersections Tests", function() {

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
        const testName =
            `base = '${parameters.base}' and comparee = '${parameters.comparee}' -> '${parameters.expected}' @unit`;
        test(testName, (done) => {
            assert.equal(findIntersect(parameters.base, parameters.comparee), parameters.expected);
            return done();
        });
    });

});
