export function normalizeFileName(fileName: string): string {
    let name = fileName;
    // make file path relative and OS independent
    name = name.toLocaleLowerCase();
    // remove all file slashes
    name = name.replace(/\//g, "###");
    name = name.replace(/\\/g, "###");
    return name;
}
