"use client";

import React, { useState } from "react";
import { Languages, ClipboardPaste, ArrowRightLeft, Loader2 } from "lucide-react";

export function Translator() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const [targetLang, setTargetLang] = useState<"EN" | "JA">("EN");

  const detectTargetLang = (text: string): "EN" | "JA" => {
    return /[぀-ヿ一-鿿]/.test(text) ? "EN" : "JA";
  };

  const handleTranslate = async (text = sourceText, lang = targetLang) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setErrorInfo("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `Status: ${response.status}`);
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (err) {
      setErrorInfo(err instanceof Error ? err.message : "翻訳中にエラーが発生しました。");
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.trim()) return;
    const detected = detectTargetLang(text);
    setTargetLang(detected);
    setTimeout(() => handleTranslate(text, detected), 0);
  };

  const toggleLang = () => {
    setTargetLang(prev => prev === "EN" ? "JA" : "EN");
  };

  return (
    <div className="bg-card border border-border border-l-2 border-l-blue-500 p-5 rounded-md space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          翻訳 (DeepL)
        </h3>
      </div>

      {errorInfo && (
        <div className="p-3 text-sm text-red-400 bg-red-950/20 rounded-md border border-red-900/40">
          {errorInfo}
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          onPaste={handlePaste}
          placeholder="翻訳するテキストを貼り付け、または入力して翻訳実行..."
          className="w-full h-24 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none text-sm font-mono"
        />

        <div className="flex items-center justify-between">
          <div className="flex bg-muted-bg rounded-md p-0.5 border border-border">
            <span className="px-3 py-1 text-xs font-medium text-muted">
              Auto Detect
            </span>
            <button
              onClick={toggleLang}
              className="px-2 text-muted hover:text-foreground transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-medium bg-card-raised text-foreground rounded-sm border border-border">
              {targetLang === "EN" ? "English" : "Japanese"}
            </span>
          </div>

          <button
            onClick={() => handleTranslate()}
            disabled={isTranslating || !sourceText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md flex items-center gap-2 transition-colors"
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : "翻訳実行"}
          </button>
        </div>

        {translatedText && (
          <div className="mt-4 p-4 bg-card-raised border border-border rounded-md relative group">
            <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {translatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(translatedText)}
              className="absolute top-2 right-2 p-1.5 bg-card border border-border text-muted hover:text-foreground rounded-sm transition-colors opacity-0 group-hover:opacity-100"
              title="コピー"
            >
              <ClipboardPaste className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
