 import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeDataToByteCode } from "./normalizeDataToByteCode.js";
import { applyMerge } from "./applyMerge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getVocabRawData() {
  try {
    const filePath = path.join(__dirname, "../vocabTrainingData/data.txt");
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.log("ERROR::", error);
    return "";
  }
}

function countPairs(data) {
  const freq = new Map();
  for (const word of data) {
    for (let i = 0; i < word.length - 1; i++) {
      const k = word[i] + " " + word[i + 1];
      freq.set(k, (freq.get(k) || 0) + 1);
    }
  }
  return freq;
}

export function trainBPE(data, targetVocabSize = 200000) {
  let seqs = normalizeDataToByteCode(data);

  // Start vocab with all byte tokens
  const vocab = new Set(seqs.flat());
  const merges = new Set();

  while (vocab.size + merges.size < targetVocabSize) {
    console.log("Current vocab size:", vocab.size + merges.size);
    const freq = countPairs(seqs);
    if (freq.size === 0) break;

    let best = null, bestCount = -1;
    for (const [pair, count] of freq) {
      if (!merges.has(pair) && count > bestCount) {
        best = pair;
        bestCount = count;
      }
    }

    if (!best) break;

    const prevLength = seqs.reduce((sum, w) => sum + w.length, 0);
    seqs = applyMerge(seqs, best);
    const newLength = seqs.reduce((sum, w) => sum + w.length, 0);

    if (newLength < prevLength) {
      merges.add(best);
      const [A, B] = best.split(" ");
      vocab.add(A + B);
    } else {
      break;
    }
  }

  return {
    merges: Array.from(merges),
    vocab: Array.from(vocab),
  };
}

const SPECIAL_TOKENS = ["[PAD]", "[UNK]", "[START]", "[END]"];

function buildVocabWithIds() {
  const text = getVocabRawData();
  const { merges, vocab } = trainBPE(text);

  const vocabList = [...SPECIAL_TOKENS, ...vocab];
  const tokenToId = {};
  const idToToken = {};

  vocabList.forEach((token, idx) => {
    tokenToId[token] = idx;
    idToToken[idx] = token;
  });

  return { merges, vocabList, tokenToId, idToToken };
}

function saveVocab(vocabData) {
  const filePath = path.join(__dirname, "../vocabTrainingData/vocabData.json");
  fs.writeFileSync(filePath, JSON.stringify(vocabData, null, 2), "utf8");
  console.log("✅ Vocab saved as vocabData.json");
}

function main() {
  const vocabData = buildVocabWithIds();
  saveVocab(vocabData);
  console.log("Merge count:", vocabData.merges.length);
  console.log("Vocab size:", vocabData.vocabList.length);
  return vocabData;
}

main();
