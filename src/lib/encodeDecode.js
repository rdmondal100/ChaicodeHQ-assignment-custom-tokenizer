// encodeDecode.js
import { applyMerge } from "./applyMerge.js";
import { normalizeDataToByteCode, wordToByteTokens } from "./normalizeDataToByteCode.js";

export function applyEncode(text, merges, tokenToId) {
  
  let seqs = normalizeDataToByteCode(text);

  // Apply merges (for frequent pairs)
  for (const mergeStr of merges) {
    const merge = mergeStr.split(" ");
    seqs = applyMerge(seqs, merge);
  }

  // Convert tokens to IDs
  const ids = seqs.flatMap((seq) =>
    seq.flatMap((token) => {
      if (tokenToId[token] !== undefined) {
        return [tokenToId[token]];
      } else {
        const bytes = wordToByteTokens(token);
        return bytes.map((b) => tokenToId[b] ?? tokenToId["[UNK]"]);
      }
    })
  );

  const bos = tokenToId["[START]"] ?? -1;
  const eos = tokenToId["[END]"] ?? -1;

  return [bos, ...ids, eos];
}

const SPECIAL_TOKENS = ["[PAD]", "[UNK]", "[START]", "[END]"];

export function applyDecode(ids, idToToken, tokenToId) {
  const bosId = tokenToId["[START]"];
  const eosId = tokenToId["[END]"];

  const tokens = ids
    .filter((id) => id !== bosId && id !== eosId)
    .map((id) => idToToken[id]);

  let output = "";
  const decoder = new TextDecoder();

  for (const token of tokens) {
    if (!token || SPECIAL_TOKENS.includes(token)) continue;

    // If it's a byte sequence like "\68"
    if (/^\\[0-9a-f]{2}$/i.test(token)) {
      const byte = parseInt(token.slice(1), 16);
      output += decoder.decode(new Uint8Array([byte]));
    } else {
      // Otherwise it's a merged/multi-character token
      // Decode each sub-byte inside if possible
      const parts = token.match(/\\[0-9a-f]{2}/gi);
      if (parts) {
        const bytes = parts.map((p) => parseInt(p.slice(1), 16));
        output += decoder.decode(new Uint8Array(bytes));
      } else {
        output += token;
      }
    }
  }

  return output.trim();
}
