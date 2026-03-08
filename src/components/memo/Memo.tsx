"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FileText, Eye, Edit3 } from "lucide-react";

export function Memo() {
  const [content, setContent] = useLocalStorage<string>("work-memo", "");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mode === "edit") {
      textareaRef.current?.focus();
    }
  }, [mode]);

  return (
    <section className="bg-card text-card-foreground rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-500" />
          メモ
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "edit"
                ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            編集
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "preview"
                ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            プレビュー
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={isMounted ? content : ""}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"# メモ\n\nMarkdownで書けます。\n- リスト\n- **太字**\n- `コード`"}
          className="w-full h-64 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none dark:text-white resize-none text-sm font-mono leading-relaxed"
        />
      ) : (
        <div className="min-h-64 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
          {isMounted && content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-600 italic">
              プレビューするコンテンツがありません
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-right">
        自動保存済み（ブラウザのlocalStorageに保存）
      </p>
    </section>
  );
}
