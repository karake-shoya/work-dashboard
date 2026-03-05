"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp, ExternalLink, Loader2 } from "lucide-react";

type QiitaArticle = {
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

export function QiitaTrends() {
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrendingArticles = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 過去1週間に作成された記事でLGTMが多いものを取得するような簡易クエリ
      // ※実際はQiita APIには/trendエンドポイントがないため、タグやいいね数で検索
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const queryStr = `created:>${d.toISOString().split('T')[0]} stocks:>10`;
      
      const res = await fetch(`https://qiita.com/api/v2/items?page=1&per_page=5&query=${encodeURIComponent(queryStr)}`);
      
      if (!res.ok) {
        throw new Error("Qiita APIの取得に失敗しました");
      }
      
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
      setError("記事の取得に失敗しました。時間をおいて再試行してください。");
      
      // フォールバック: モックデータを表示
      setArticles([
        {
          id: "mock1",
          title: "フロントエンド開発の最新トレンド2026",
          url: "https://qiita.com",
          likes_count: 128,
          created_at: new Date().toISOString(),
          user: { id: "userA", profile_image_url: "https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/0/ccf00cf044cc4a9/profile-images/1473693600" }
        },
        {
          id: "mock2",
          title: "Next.js App Routerでの状態管理ベストプラクティス",
          url: "https://qiita.com",
          likes_count: 85,
          created_at: new Date().toISOString(),
          user: { id: "userB", profile_image_url: "https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/0/ccf00cf044cc4a9/profile-images/1473693600" }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingArticles();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" />
          Qiita Trends
        </h3>
        <button 
          onClick={fetchTrendingArticles}
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
              {error} - モックデータを表示しています。
            </div>
          )}
          
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.id} className="group">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-transparent dark:border-gray-700/50 hover:border-green-200 dark:hover:border-green-900/50 transition-all text-left"
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
        </div>
      )}
    </div>
  );
}
