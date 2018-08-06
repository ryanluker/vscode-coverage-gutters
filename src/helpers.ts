
/**
 * Finds the matching suffixes of the string, stripping off the non-matching starting characters.
 * @param base
 * @param comparee
 */
export function findIntersect(base: string, comparee: string): string {
    const a = [...base].reverse();
    const b = [...comparee].reverse();

    // find the intersection and reverse it back into a string
    const intersection: string[] = [];
    let pos = 0;
    // stop when strings at pos are no longer are equal
    while (a[pos] === b[pos]) {
        // if we reached the end or there isnt a value for that pos
        // exit the while loop
        if (!a[pos] || !b[pos]) { break; }
        intersection.push(a[pos]);
        pos++;
    }
    const subInt = intersection.reverse().join("");
    return subInt;
}

export function normalizeFileName(fileName: string): string {
    let name = fileName;
    // make file path relative and OS independent
    name = name.toLocaleLowerCase();
    // remove all file slashes
    name = name.replace(/\//g, "###");
    name = name.replace(/\\/g, "###");
    return name;
}

/**
 * Checks that the passed in files are the same when compared relatively from the rootFolder
 * @param fileOne first file for comparing
 * @param fileTwo second file for comparing
 * @param rootFolder folder to substring on to create relative paths
 */
export function areFilesRelativeEquals(fileOne: string, fileTwo: string, rootFolder: string): boolean {
    try {
        /**
         * Note: string.split causes issues if you have more then one folder with the workspace name.
         * Instead we use substring and indexOf inorder to string off the first part of the path while
         * preserving the relative portion after the workspace folder name.
         */
        const relativeFileOne = fileOne.substring(fileOne.indexOf(rootFolder));
        const relativeFileTwo = fileTwo.substring(fileTwo.indexOf(rootFolder));

        if (relativeFileOne === relativeFileTwo) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        // catch possible index out of bounds errors
        return false;
    }
}
