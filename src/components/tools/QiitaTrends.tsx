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
    <div className="bg-card border border-border border-l-2 border-l-green-500 p-5 rounded-md space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-green-400" />
          Qiita Trends
        </h3>
        <button
          onClick={load}
          disabled={isLoading}
          className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
          title="更新"
        >
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6 text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="p-2 text-xs text-amber-400 bg-amber-950/20 rounded-sm border border-amber-900/30">
              {error}
            </div>
          )}
          <ul className="space-y-2">
            {articles.map((article) => (
              <li key={article.id} className="group">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted-bg hover:bg-card-raised rounded-md border border-border hover:border-foreground/20 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1 font-medium text-green-400 bg-green-950/30 px-1.5 py-0.5 rounded-sm font-mono">
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
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors border border-border"
          >
            すべて見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
