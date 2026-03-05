"use client";

import React, { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CalendarDays, Flag } from "lucide-react";
import { differenceInDays, differenceInMonths, isValid, parseISO } from "date-fns";

export function BaseDateCounter() {
  const [baseDateStr, setBaseDateStr] = useLocalStorage<string>("work-base-date", "");

  const stats = useMemo(() => {
    if (!baseDateStr) return null;
    const baseDate = parseISO(baseDateStr);
    if (!isValid(baseDate)) return null;

    const now = new Date();
    // 基準日からの経過日数
    const days = differenceInDays(now, baseDate);
    // 基準日からの経過月数（概算で表示する場合はmonths + 残り日数など）
    const months = differenceInMonths(now, baseDate);
    
    // 経過日数から月数を引いた残りの日数を計算（簡易的な計算）
    const dateAfterMonths = new Date(baseDate);
    dateAfterMonths.setMonth(dateAfterMonths.getMonth() + months);
    const remainingDays = differenceInDays(now, dateAfterMonths);

    return { days, months, remainingDays };
  }, [baseDateStr]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          基準日（プロジェクト開始日など）
        </label>
        <input 
          type="date" 
          value={baseDateStr}
          onChange={(e) => setBaseDateStr(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
        />
      </div>

      {stats ? (
        <div className="flex items-center gap-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-purple-800 rounded-full shadow-sm text-purple-600 dark:text-purple-300">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              基準日からの経過
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {Math.max(0, stats.days)}<span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-1">日目</span>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                （{Math.max(0, stats.months)}ヶ月と{Math.max(0, stats.remainingDays)}日）
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          基準日を設定すると経過日数が表示されます
        </div>
      )}
    </div>
  );
}
