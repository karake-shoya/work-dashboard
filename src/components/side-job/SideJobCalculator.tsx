"use client";

import React, { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Briefcase, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

// 今月の残り平日・土日日数を計算する
function calcRemainingDays(includeToday: boolean): { weekdays: number; weekends: number } {
  const today = new Date();
  const start = new Date(today);
  if (!includeToday) {
    start.setDate(start.getDate() + 1);
  }

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let weekdays = 0;
  let weekends = 0;

  for (let d = new Date(start); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      weekends++;
    } else {
      weekdays++;
    }
  }

  return { weekdays, weekends };
}

export function SideJobCalculator() {
  const [currentHours, setCurrentHours] = useLocalStorage<number>("side-job-current-hours", 0);
  const [targetHours, setTargetHours] = useLocalStorage<number>("side-job-target-hours", 0);
  const [weekendHours, setWeekendHours] = useLocalStorage<number>("side-job-weekend-hours", 0);
  const [includeToday, setIncludeToday] = useLocalStorage<boolean>("side-job-include-today", true);

  // 計算ロジック
  const result = useMemo(() => {
    const remaining = targetHours - currentHours;
    const { weekdays, weekends } = calcRemainingDays(includeToday);
    const weekendTotal = weekends * weekendHours;
    const weekdayNeeded = remaining - weekendTotal;
    const perWeekday = weekdays > 0 ? weekdayNeeded / weekdays : null;

    return { remaining, weekdays, weekends, weekendTotal, weekdayNeeded, perWeekday };
  }, [currentHours, targetHours, weekendHours, includeToday]);

  // 数値入力のハンドラ
  const handleNumberInput = (
    setter: (v: number) => void,
    value: string
  ) => {
    const parsed = parseFloat(value);
    setter(isNaN(parsed) ? 0 : parsed);
  };

  // トグルスタイル
  const toggleTrackClass = `block w-10 h-6 rounded-full transition-colors ${includeToday ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`;
  const toggleDotClass = `dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includeToday ? "transform translate-x-4" : ""}`;

  // 結果の状態判定
  const isOverTarget = result.remaining < 0;
  const noWeekdaysLeft = result.weekdays === 0 && !isOverTarget;
  const weekdayNeededNegative = result.weekdayNeeded < 0 && !isOverTarget;

  // 平日1日あたりの時間表示
  const renderPerWeekday = () => {
    if (targetHours === 0) {
      return <span className="text-gray-400 dark:text-gray-500">上限時間を入力してください</span>;
    }
    if (isOverTarget) {
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>上限時間を超過しています ({Math.abs(result.remaining).toFixed(1)}h オーバー)</span>
        </div>
      );
    }
    if (result.remaining === 0) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>目標達成済み！</span>
        </div>
      );
    }
    if (noWeekdaysLeft) {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>残り平日がありません（土日のみ: {result.weekendTotal.toFixed(1)}h 予定）</span>
        </div>
      );
    }
    if (weekdayNeededNegative) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>土日の稼働だけで達成できます（平日稼働不要）</span>
        </div>
      );
    }
    if (result.perWeekday === null) {
      return <span className="text-gray-400">-</span>;
    }
    return (
      <span className="text-3xl font-bold text-blue-700 dark:text-blue-300 font-mono">
        {result.perWeekday.toFixed(1)}h
      </span>
    );
  };

  return (
    <div className="space-y-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl">

      {/* 入力フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            現在の稼働時間 (h)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={currentHours}
            onChange={(e) => handleNumberInput(setCurrentHours, e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            placeholder="例: 12"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            上限時間 (h)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={targetHours}
            onChange={(e) => handleNumberInput(setTargetHours, e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            placeholder="例: 40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            土日1日の稼働予定 (h)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={weekendHours}
            onChange={(e) => handleNumberInput(setWeekendHours, e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            placeholder="例: 3"
          />
        </div>
      </div>

      {/* 今日を含むトグル */}
      <label className="flex items-center cursor-pointer w-fit">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={includeToday}
            onChange={(e) => setIncludeToday(e.target.checked)}
          />
          <div className={toggleTrackClass}></div>
          <div className={toggleDotClass}></div>
        </div>
        <div className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          今日を残り日数に含む
        </div>
      </label>

      {/* 計算結果 */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">

        {/* 残り稼働時間・日数内訳 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">残り稼働時間</div>
            <div className={`text-xl font-bold font-mono ${isOverTarget ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
              {targetHours === 0 ? "-" : `${result.remaining.toFixed(1)}h`}
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">残り平日</div>
            <div className="text-xl font-bold font-mono text-foreground">
              {result.weekdays}<span className="text-sm font-normal text-gray-500 ml-0.5">日</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">残り土日</div>
            <div className="text-xl font-bold font-mono text-foreground">
              {result.weekends}<span className="text-sm font-normal text-gray-500 ml-0.5">日</span>
            </div>
          </div>
        </div>

        {/* メイン結果：平日1日あたり */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            平日1日あたりの必要稼働時間
          </div>
          <div className="text-foreground">
            {renderPerWeekday()}
          </div>
          {!isOverTarget && result.perWeekday !== null && result.weekdayNeeded >= 0 && result.weekdays > 0 && (
            <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
              土日合計 {result.weekendTotal.toFixed(1)}h + 平日 {result.weekdayNeeded.toFixed(1)}h = {result.remaining.toFixed(1)}h
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
