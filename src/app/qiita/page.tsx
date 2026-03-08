"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { fetchQiitaTrends, type QiitaArticle } from "@/components/tools/QiitaTrends";

export default function QiitaPage() {
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      setArticles(await fetchQiitaTrends(20));
    } catch {
      setError("記事の取得に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="ダッシュボードへ戻る"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-500" />
                Qiita Trends
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                過去7日間のトレンド記事
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4" />
            更新
          </button>
        </header>

        {error && (
          <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/40">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-3">
            {articles.map((article, index) => (
              <li key={article.id} className="group">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-card border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-900/50 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <span className="text-lg font-bold text-gray-200 dark:text-gray-700 w-7 shrink-0 text-right mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                        LGTM {article.likes_count}
                      </span>
                      <span>@{article.user.id}</span>
                      <span>{new Date(article.created_at).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
