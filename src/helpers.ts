
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
