// normalizeDataToByteCode.js

// Convert input string into sequences of UTF-8 byte tokens
export function normalizeDataToByteCode(data) {
  try {
    const normalized = data.normalize("NFKC");
    const encoder = new TextEncoder();

    // Encode into bytes
    const bytes = encoder.encode(normalized);

    // Represent each byte as "\xx" hex token
    // e.g. 104 => "\68" for 'h'
    const tokens = Array.from(bytes, (n) => `\\${n.toString(16).padStart(2, "0")}`);

    // BPE expects a sequence of sequences (words split by spaces)
    // Split at space byte (0x20) → treat as word separator
    const sequences = [];
    let current = [];

    for (const tok of tokens) {
      if (tok === "\\20") {
        if (current.length > 0) {
          sequences.push(current);
          current = [];
        }
      } else {
        current.push(tok);
      }
    }
    if (current.length > 0) sequences.push(current);

    return sequences;
  } catch (error) {
    console.log("ERROR:::->>", error);
    return [];
  }
}

// Fallback: convert a single word into byte tokens
export function wordToByteTokens(word) {
  return Array.from(
    new TextEncoder().encode(word),
    (n) => `\\${n.toString(16).padStart(2, "0")}`
  );
}
