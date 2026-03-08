"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, ExternalLink, Loader2, ArrowRight } from "lucide-react";

export type QiitaArticle = {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  user: {
    id: string;
    profile_image_url: string;
  };
  created_at: string;
};

export async function fetchQiitaTrends(perPage: number): Promise<QiitaArticle[]> {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const queryStr = `created:>${d.toISOString().split("T")[0]} stocks:>10`;
  const res = await fetch(
    `https://qiita.com/api/v2/items?page=1&per_page=${perPage}&query=${encodeURIComponent(queryStr)}`
  );
  if (!res.ok) throw new Error("Qiita APIの取得に失敗しました");
  return res.json();
}

export function QiitaTrends() {
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      setArticles(await fetchQiitaTrends(3));
    } catch {
      setError("取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" />
          Qiita Trends
        </h3>
        <button
          onClick={load}
          disabled={isLoading}
          className="text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
          title="更新"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="p-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded">
              {error}
            </div>
          )}
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.id} className="group">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-transparent dark:border-gray-700/50 hover:border-green-200 dark:hover:border-green-900/50 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {article.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                      LGTM {article.likes_count}
                    </span>
                    <span className="truncate">@{article.user.id}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <Link
            href="/qiita"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-green-100 dark:border-green-900/40"
          >
            すべて見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
