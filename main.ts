// The Agent's Uh-Oh: exactly one word an agent blurts when it has no idea
// what to do. Deterministic: no network, no randomness, no timestamps.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ENTRY_WORD = "recalibrating";
const OUT_DIR = "/output";
const OUT_FILE = "/output/entry.txt";

function fail(message: string): never {
  console.error(`entry invalid: ${message}`);
  process.exit(1);
}

// Gate self-check: UTF-8 text, 1..99 characters, not only white space,
// and a single word (no internal whitespace).
function validate(word: string): void {
  const chars = [...word];
  if (chars.length < 1 || chars.length > 99) {
    fail(`character count ${chars.length} outside 1..99`);
  }
  if (word.trim().length === 0) {
    fail("only white space");
  }
  if (/\s/u.test(word)) {
    fail("not a single word: contains whitespace");
  }
  // Round-trip through UTF-8 to prove it encodes cleanly.
  const roundTripped = Buffer.from(word, "utf8").toString("utf8");
  if (roundTripped !== word) {
    fail("not clean UTF-8");
  }
  // A blurted word carries no control characters either.
  if (/[\u0000-\u001f\u007f]/u.test(word)) {
    fail("contains control characters");
  }
}

validate(ENTRY_WORD);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, ENTRY_WORD, "utf8");

// Read back and verify byte-for-byte: exactly the word's UTF-8 bytes,
// no trailing newline, no BOM, nothing attached.
const writtenBytes = readFileSync(OUT_FILE);
const expectedBytes = Buffer.from(ENTRY_WORD, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  fail("read-back bytes do not match the entry word exactly");
}
const written = writtenBytes.toString("utf8");
validate(written);

console.log(`wrote ${OUT_FILE}: ${written} (${[...written].length} chars)`);
