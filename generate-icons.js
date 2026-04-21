/**
 * Run: node generate-icons.js
 * Generates PNG icons from the SVG for the Edge extension manifest.
 * Requires no dependencies — uses built-in modules only (Node 18+).
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const svgSource = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'), 'utf8');

// Minimal BMP-based PNG won't work without canvas, so we create a tiny
// inline-SVG data-URI based approach. For development, Edge accepts SVGs
// referenced from the manifest if we adjust, but for production PNGs are
// needed. For now, create a placeholder 1x1 PNG for each size so the
// manifest is valid, and note to the developer to replace with real PNGs.

// Minimal valid PNG (1x1 transparent) — we'll create properly sized ones
// by embedding size info. This is a valid PNG file for each size.
function createMinimalPng(size) {
    // For development, copy the SVG approach — Edge actually loads fine
    // with SVG icons during development via edge://extensions
    // For production, use a proper image tool.

    // This creates a valid minimal PNG with the correct dimensions in the header
    const PNG_HEADER = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
    ]);

    // IHDR chunk
    const width = size;
    const height = size;
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 6;  // color type (RGBA)
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace

    const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdrChunk = Buffer.alloc(4 + 4 + 13 + 4);
    ihdrChunk.writeUInt32BE(13, 0);
    ihdrChunk.write('IHDR', 4);
    ihdrData.copy(ihdrChunk, 8);
    ihdrChunk.writeInt32BE(ihdrCrc, 21);

    // IDAT chunk — compressed pixel data
    // Each row: filter byte (0) + width * 4 bytes (RGBA)
    const rawData = Buffer.alloc((1 + width * 4) * height);
    for (let y = 0; y < height; y++) {
        const rowOffset = y * (1 + width * 4);
        rawData[rowOffset] = 0; // no filter
        for (let x = 0; x < width; x++) {
            const px = rowOffset + 1 + x * 4;
            // Brand gradient color: blend from #3d7ea6 to #1a4a6e
            const t = (x + y) / (width + height);
            rawData[px] = Math.round(0x3d + (0x1a - 0x3d) * t);     // R
            rawData[px + 1] = Math.round(0x7e + (0x4a - 0x7e) * t); // G
            rawData[px + 2] = Math.round(0xa6 + (0x6e - 0xa6) * t); // B
            rawData[px + 3] = 255;                                     // A
        }
    }

    const { deflateSync } = require('zlib');
    const compressed = deflateSync(rawData);

    const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
    const idatChunk = Buffer.alloc(4 + 4 + compressed.length + 4);
    idatChunk.writeUInt32BE(compressed.length, 0);
    idatChunk.write('IDAT', 4);
    compressed.copy(idatChunk, 8);
    idatChunk.writeInt32BE(idatCrc, 8 + compressed.length);

    // IEND chunk
    const iendCrc = crc32(Buffer.from('IEND'));
    const iendChunk = Buffer.alloc(12);
    iendChunk.writeUInt32BE(0, 0);
    iendChunk.write('IEND', 4);
    iendChunk.writeInt32BE(iendCrc, 8);

    return Buffer.concat([PNG_HEADER, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 for PNG chunks
function crc32(buf) {
    let table = crc32.table;
    if (!table) {
        table = crc32.table = new Int32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
        crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return crc ^ -1;
}

// Generate icons
const iconsDir = path.join(__dirname, 'icons');
for (const size of sizes) {
    const png = createMinimalPng(size);
    const filePath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(filePath, png);
    console.log(`Created ${filePath} (${size}x${size}, ${png.length} bytes)`);
}

console.log('\nDone! For production, replace these with high-quality rendered PNGs from icon.svg');
