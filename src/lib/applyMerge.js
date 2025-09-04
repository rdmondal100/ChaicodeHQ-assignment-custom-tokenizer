// applyMerge.js
export function applyMerge(seqs, pair) {
  let A, B;

  if (Array.isArray(pair)) {
    [A, B] = pair;
  } else if (typeof pair === "string") {
    [A, B] = pair.split(" ");
  } else {
    return seqs; // unsupported type
  }

  if (!A || !B) return seqs;

  const AB = A + B;
  let changed = false;

  const outSeqs = seqs.map((seq) => {
    const out = [];
    for (let i = 0; i < seq.length; ) {
      if (i < seq.length - 1 && seq[i] === A && seq[i + 1] === B) {
        out.push(AB);
        i += 2;
        changed = true;
      } else {
        out.push(seq[i]);
        i += 1;
      }
    }
    return out;
  });

  // If nothing changed, return original reference
  return changed ? outSeqs : seqs;
}
