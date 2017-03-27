module.exports.test = function test(testNumber) {
    if(testNumber === 1) {
        return true;
    }
    if(testNumber === 2) {
        return false;
    }
    if(testNumber === 3) return "notNull";
    return "null";
}