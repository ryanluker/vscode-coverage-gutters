module.exports.test = function test(testNumber) {
    if(testNumber === 1) {
        return true;
    }
    if(testNumber === 2) {
        return false;
    }

    if(testNumber === 3) return "notNull";
    if(testNumber === 4) return "reallyNull";

    testNumber = testNumber === 5 ? "woop":"wap";

    const testComplexReturn = callbackBased(111, subTest);

    if(testNumber === 6) {
        testNumber = testNumber ? subTest(testNumber) : "neverhappen";
    }

    return testNumber;
}

function callbackBased(testNumber, done) {
    return done(testNumber.toString());
}

function subTest(testString) {
    testString = testString.toString();
    return testString.toUpperCase();
}