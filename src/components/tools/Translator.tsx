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
    return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(text) ? "EN" : "JA";
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
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-500" />
          翻訳 (DeepL)
        </h3>
      </div>

      {errorInfo && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
          {errorInfo}
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          onPaste={handlePaste}
          placeholder="翻訳するテキストを貼り付け、または入力して翻訳実行..."
          className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white resize-none text-sm"
        />

        <div className="flex items-center justify-between">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <span className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              Auto Detect
            </span>
            <button
              onClick={toggleLang}
              className="px-2 text-gray-400 hover:text-foreground transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-600 text-foreground rounded border border-gray-200 dark:border-gray-500 shadow-sm">
              {targetLang === "EN" ? "English" : "Japanese"}
            </span>
          </div>

          <button
            onClick={() => handleTranslate()}
            disabled={isTranslating || !sourceText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : "翻訳実行"}
          </button>
        </div>

        {translatedText && (
          <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg relative group">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {translatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(translatedText)}
              className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-blue-500 shadow-sm border border-gray-200 dark:border-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
