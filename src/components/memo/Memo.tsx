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
    <section className="bg-card border border-border border-l-2 border-l-yellow-500 rounded-md p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-yellow-400" />
          メモ
        </h2>
        <div className="flex bg-muted-bg border border-border rounded-md p-0.5 gap-0.5">
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "edit"
                ? "bg-card-raised border border-border text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            編集
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "preview"
                ? "bg-card-raised border border-border text-foreground"
                : "text-muted hover:text-foreground"
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
          className="w-full h-64 px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none text-sm font-mono leading-relaxed"
        />
      ) : (
        <div className="min-h-64 px-4 py-3 bg-background border border-border rounded-md overflow-auto">
          {isMounted && content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted italic">
              プレビューするコンテンツがありません
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted text-right font-mono">
        自動保存済み（ブラウザのlocalStorageに保存）
      </p>
    </section>
  );
}
