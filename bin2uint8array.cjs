// Quick hack to dump a binary file (like a sysex dump)
// as a raw Uint8Array.

// Usage:
//   node ./bin2uint8array.cjs someFile.syx someFile.ts

const fs = require("node:fs");
const [input, output] = process.argv.slice(2);
const bytes = fs.readFileSync(input);
const rows = [];
for (let i = 0; i < bytes.length; i += 16) {
  rows.push("  " + Array.from(
    bytes.subarray(i, i + 16), b =>
      "0x" + b.toString(16).padStart(2, "0"))
     .join(", "));
}
fs.writeFileSync(output, `export const data = new Uint8Array([\n${rows.join(",\n")}\n]);\n`);
