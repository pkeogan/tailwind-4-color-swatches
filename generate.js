const fs = require('fs');
const culori = require('culori');

// Read and parse the JSON file
const jsonData = fs.readFileSync('tailwind-4-colors.json', 'utf8');
const colors = JSON.parse(jsonData);

// Calculate total number of blocks: group start + color blocks + group end for each color
let totalBlocks = 0;
colors.forEach(color => {
    totalBlocks += 2; // Group start and end
    totalBlocks += Object.keys(color.shades).length; // Number of shades
});

// Open the .ase file for writing
const fd = fs.openSync('tailwind-4-colors.ase', 'w');

// Write the .ase header
fs.writeSync(fd, Buffer.from('ASEF', 'ascii')); // Signature
fs.writeSync(fd, Buffer.from([0x00, 0x01, 0x00, 0x00])); // Version 1.0
const blockCountBuffer = Buffer.alloc(4);
blockCountBuffer.writeUInt32BE(totalBlocks, 0);
fs.writeSync(fd, blockCountBuffer);

// Function to convert a string to UTF-16BE with null terminator
function stringToUtf16BE(str) {
    const buf = Buffer.from(str, 'utf16le');
    for (let i = 0; i < buf.length; i += 2) {
        [buf[i], buf[i + 1]] = [buf[i + 1], buf[i]];
    }
    return Buffer.concat([buf, Buffer.from([0x00, 0x00])]);
}

// Function to write a group start block
function writeGroupStart(fd, groupName) {
    const nameBuffer = stringToUtf16BE(groupName);
    const nameLength = groupName.length + 1;
    const blockData = Buffer.concat([
        Buffer.from([(nameLength >> 8) & 0xFF, nameLength & 0xFF]),
        nameBuffer
    ]);
    const blockLength = blockData.length;
    const blockType = 0xC001; // Group start
    const blockHeader = Buffer.from([
        (blockType >> 8) & 0xFF, blockType & 0xFF,
        (blockLength >> 24) & 0xFF, (blockLength >> 16) & 0xFF,
        (blockLength >> 8) & 0xFF, blockLength & 0xFF
    ]);
    fs.writeSync(fd, blockHeader);
    fs.writeSync(fd, blockData);
}

// Function to write a color block
function writeColorBlock(fd, colorName, r, g, b) {
    const nameBuffer = stringToUtf16BE(colorName);
    const nameLength = colorName.length + 1;
    const modelBuffer = Buffer.from('RGB ', 'ascii');
    const rBuffer = Buffer.alloc(4);
    rBuffer.writeFloatBE(r, 0);
    const gBuffer = Buffer.alloc(4);
    gBuffer.writeFloatBE(g, 0);
    const bBuffer = Buffer.alloc(4);
    bBuffer.writeFloatBE(b, 0);
    const typeBuffer = Buffer.from([0x00, 0x02]); // Normal color type
    const blockData = Buffer.concat([
        Buffer.from([(nameLength >> 8) & 0xFF, nameLength & 0xFF]),
        nameBuffer,
        modelBuffer,
        rBuffer,
        gBuffer,
        bBuffer,
        typeBuffer
    ]);
    const blockLength = blockData.length;
    const blockType = 0x0001; // Color entry
    const blockHeader = Buffer.from([
        (blockType >> 8) & 0xFF, blockType & 0xFF,
        (blockLength >> 24) & 0xFF, (blockLength >> 16) & 0xFF,
        (blockLength >> 8) & 0xFF, blockLength & 0xFF
    ]);
    fs.writeSync(fd, blockHeader);
    fs.writeSync(fd, blockData);
}

// Function to write a group end block
function writeGroupEnd(fd) {
    const blockType = 0xC002; // Group end
    const blockLength = 0;
    const blockHeader = Buffer.from([
        (blockType >> 8) & 0xFF, blockType & 0xFF,
        0x00, 0x00, 0x00, 0x00
    ]);
    fs.writeSync(fd, blockHeader);
}

// Process each color and its shades
colors.forEach(color => {
    writeGroupStart(fd, color.color);
    Object.entries(color.shades).forEach(([shade, oklchStr]) => {
        const name = shade === 'default' ? color.color : `${color.color}-${shade}`;
        // Parse OKLCH and convert to sRGB
        const oklchColor = culori.parse(oklchStr);
        const srgbColor = culori.rgb(oklchColor);
        const r = Math.max(0, Math.min(1, srgbColor.r)); // Clamp to [0, 1]
        const g = Math.max(0, Math.min(1, srgbColor.g));
        const b = Math.max(0, Math.min(1, srgbColor.b));
        writeColorBlock(fd, name, r, g, b);
    });
    writeGroupEnd(fd);
});

// Close the file
fs.closeSync(fd);

console.log('ASE file "tailwind-4-colors.ase" has been created successfully.');