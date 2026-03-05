"use client";

import React, { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Languages, Settings, ClipboardPaste, ArrowRightLeft, Loader2 } from "lucide-react";

export function Translator() {
  const [apiKey, setApiKey] = useLocalStorage<string>("work-deepl-api-key", "");
  const [showSettings, setShowSettings] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  
  // JA -> EN か EN -> JA かのトグル
  // 簡易的にDeepLは自動判定があるため、Targetだけ指定する
  const [targetLang, setTargetLang] = useState<"EN" | "JA">("EN");

  const handleTranslate = async () => {
    if (!apiKey) {
      setErrorInfo("APIキーが設定されていません。設定からDeepL APIキーを入力してください。");
      setShowSettings(true);
      return;
    }
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setErrorInfo("");

    try {
      // DeepL Free API Endpoint
      // 本来はバックエンドを経由するのが安全ですが、要件に基づきフロントから直接リクエストします。
      const url = apiKey.endsWith(":fx") 
        ? "https://api-free.deepl.com/v2/translate" 
        : "https://api.deepl.com/v2/translate";

      const params = new URLSearchParams();
      params.append("auth_key", apiKey);
      params.append("text", sourceText);
      params.append("target_lang", targetLang);

      const response = await fetch(url, {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`翻訳に失敗しました (Status: ${response.status})`);
      }

      const data = await response.json();
      if (data.translations && data.translations.length > 0) {
        setTranslatedText(data.translations[0].text);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setErrorInfo("翻訳中にエラーが発生しました。APIキーやネットワークを確認してください。");
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePasteTranslate = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        // sourceTextがセットされてから少し待って翻訳実行（状態反映のため）
        setTimeout(() => {
          const btn = document.getElementById("translate-btn");
          if (btn) btn.click();
        }, 100);
      }
    } catch (err) {
      console.error("クリップボード読み取りエラー:", err);
      setErrorInfo("クリップボードの読み取りが許可されていません。");
    }
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
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="設定"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm border border-gray-200 dark:border-gray-700">
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            DeepL API Auth Key
          </label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="APIキーを入力..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ※入力したキーはブラウザ(localStorage)にのみ保存されます。
          </p>
        </div>
      )}

      {errorInfo && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
          {errorInfo}
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <textarea 
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="翻訳するテキストを入力..."
            className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white resize-none text-sm"
          />
          <button 
            onClick={handlePasteTranslate}
            className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-500 shadow-sm border border-gray-200 dark:border-gray-600 rounded-md transition-colors"
            title="ペーストして翻訳"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </div>

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
            id="translate-btn"
            onClick={handleTranslate}
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
