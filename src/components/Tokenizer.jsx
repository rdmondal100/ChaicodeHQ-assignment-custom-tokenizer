"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { applyEncode, applyDecode } from "@/lib/encodeDecode";
import vocabData from "@/vocabTrainingData/vocabData.json";
import { Badge } from "./ui/badge";

// Hash and color helpers
function getHash(str) {
  let hash = 0;
  const s = str.toString();
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}
function getColorForToken(token) {
  const hue = getHash(token) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Convert byte tokens (like "\\68") back into readable characters
function decodeToken(token) {
  if (!token) return "";
  const regex = /\\[0-9a-f]{2}/gi;
  if (regex.test(token)) {
    const bytes = [];
    const parts = token.match(regex);
    if (parts) {
      for (const p of parts) {
        bytes.push(parseInt(p.slice(1), 16));
      }
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
  }
  return token;
}

export default function Tokenizer() {
  const [text, setText] = useState("hi everyone how are you ?");
  const [ids, setIds] = useState([]);
  const [decodedAuto, setDecodedAuto] = useState("");

  const [manualIds, setManualIds] = useState("");
  const [manualDecoded, setManualDecoded] = useState("");

  const [tab, setTab] = useState("id");

  // Auto-encode/decode as user types
  useEffect(() => {
    const enc = applyEncode(text, vocabData.merges, vocabData.tokenToId);
    setIds(enc);
    const dec = applyDecode(enc, vocabData.idToToken, vocabData.tokenToId);
    setDecodedAuto(dec);
  }, [text]);

  const handleManualDecode = () => {
    const arr = manualIds
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    const dec = applyDecode(arr, vocabData.idToToken, vocabData.tokenToId);
    setManualDecoded(dec);
  };

  const bosId = vocabData.tokenToId["[START]"];
  const eosId = vocabData.tokenToId["[END]"];

  return (
    <div className="container mx-auto mt-10 w-full flex flex-col gap-5 p-3">
      {/* Input */}
      <div className="wrapper flex flex-col lg:flex-row gap-5 w-full ">
        <Card className="shadow-md w-full lg:min-h-96   ">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex gap-3">
              <div> Enter Text to Tokenize → </div>{" "}
              <Badge className=" text-normal bg-primary/20 text-primary">
                <span className="font-bold text-[18px]"> {text.length} </span>Charecters
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              placeholder="Type your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] lg:min-h-60"
            />
          </CardContent>
        </Card>

        {/* Encoded tokens */}
        <Card className="shadow-md w-full">
          <CardHeader className="flex justify-between items-center">
             <CardTitle className="text-lg font-bold flex gap-3">
              <div>  Token Visualization → </div>{" "}
              <Badge className=" text-normal bg-primary/20 text-primary">
                <span className="font-bold text-[18px]"> {ids?.length ? ids.length - 2 : 0} </span>Tokens
              </Badge>
            </CardTitle>
            <Tabs value={tab} onValueChange={setTab} className="w-fit">
              <TabsList>
                <TabsTrigger value="id">ID</TabsTrigger>
                <TabsTrigger value="word">WORD</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <AnimatePresence>
              {ids.length > 0 ? (
                ids.map((id, idx) => {
                  if (id === bosId || id === eosId) return null;
                  const rawTok = vocabData.idToToken[id] ?? "[UNK]";
                  const readableTok = decodeToken(rawTok);
                  const bg = getColorForToken(readableTok);

                  return (
                    <motion.div
                      key={`${id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="px-3 py-1 rounded-full text-sm font-medium shadow-sm flex flex-col items-center"
                      style={{ backgroundColor: bg, color: "#fff" }}
                    >
                      {tab === "word" ? (
                        <span className="font-mono">{readableTok}</span>
                      ) : (
                        <span className="font-mono">{id}</span>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">
                  No tokens yet. Start typing above.
                </p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
