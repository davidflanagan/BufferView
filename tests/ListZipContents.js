// Given an ArrayBuffer that holds a zip archive,
// return an array filenames
function listZipContents(buffer) {
    var bv = new BufferView(buffer, BufferView.LE);
    
    // Verify that this is actually a 
    var magic = bv.readUnsignedShort();
    if (magic !== 0x4b50) throw new Error("Not a zip file");

    // Skip to the end of the file and search backwards for the
    // end-of-central-directory record
    bv.index = bv.byteLength - 22;
    while((magic = bv.readUnsignedInt()) !== 0x06054b50) bv.index -= 5;

    // Skip preliminary bytes in the e-o-c-d record
    bv.skip(12);
    
    // Read the offset of the start of the central directory, and go there.
    bv.index = bv.readUnsignedInt();
    
    var filenames = [];  // where we'll store our results

    // While the central directory contains another file entry
    while(bv.readUnsignedInt() === 0x02014b50) {
        bv.skip(24);
        var namelen = bv.readUnsignedShort();
        var extralen = bv.readUnsignedShort();
        var commentlen = bv.readUnsignedShort();
        bv.skip(12);
        // We're assuming all names are ASCII and the length in bytes
        // equals the length in characters.  Using readUTF8Chars instead
        // of a simpler but non-existent readASCIIChars method.
        filenames.push(bv.readUTF8Chars(namelen));
        bv.skip(extralen + commentlen);
    }

    return filenames;
}
