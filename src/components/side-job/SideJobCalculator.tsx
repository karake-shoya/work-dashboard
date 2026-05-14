"use client";

import React, { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Briefcase, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import * as HolidayJp from "@holiday-jp/holiday_jp";

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
    if (dow === 0 || dow === 6 || HolidayJp.isHoliday(d)) {
      weekends++;
    } else {
      weekdays++;
    }
  }

  return { weekdays, weekends };
}

export function SideJobCalculator() {
  const [currentHours, setCurrentHours] = useLocalStorage<number | null>("side-job-current-hours", null);
  const [targetHours, setTargetHours] = useLocalStorage<number | null>("side-job-target-hours", null);
  const [weekendHours, setWeekendHours] = useLocalStorage<number | null>("side-job-weekend-hours", null);
  const [includeToday, setIncludeToday] = useLocalStorage<boolean>("side-job-include-today", true);

  const result = useMemo(() => {
    const current = currentHours ?? 0;
    const target = targetHours ?? 0;
    const weekend = weekendHours ?? 0;
    const remaining = target - current;
    const { weekdays, weekends } = calcRemainingDays(includeToday);
    const weekendTotal = weekends * weekend;
    const weekdayNeeded = remaining - weekendTotal;
    const perWeekday = weekdays > 0 ? weekdayNeeded / weekdays : null;

    return { remaining, weekdays, weekends, weekendTotal, weekdayNeeded, perWeekday };
  }, [currentHours, targetHours, weekendHours, includeToday]);

  const handleNumberInput = (
    setter: (v: number | null) => void,
    value: string
  ) => {
    if (value === "") {
      setter(null);
      return;
    }
    const parsed = parseFloat(value);
    setter(isNaN(parsed) ? null : parsed);
  };

  const toggleTrackClass = `block w-10 h-6 rounded-full transition-colors ${includeToday ? "bg-blue-500" : "bg-border"}`;
  const toggleDotClass = `dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includeToday ? "transform translate-x-4" : ""}`;

  const hasTarget = targetHours !== null && targetHours > 0;
  const isOverTarget = result.remaining < 0;
  const noWeekdaysLeft = result.weekdays === 0 && !isOverTarget;
  const weekdayNeededNegative = result.weekdayNeeded < 0 && !isOverTarget;

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 font-mono text-sm";
  const labelClass = "block text-xs font-semibold text-muted uppercase tracking-widest";

  const renderPerWeekday = () => {
    if (!hasTarget) {
      return <span className="text-muted text-sm">上限時間を入力してください</span>;
    }
    if (isOverTarget) {
      return (
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm">上限時間を超過しています ({Math.abs(result.remaining).toFixed(1)}h オーバー)</span>
        </div>
      );
    }
    if (result.remaining === 0) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">目標達成済み！</span>
        </div>
      );
    }
    if (noWeekdaysLeft) {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm">残り平日がありません（土日祝のみ: {result.weekendTotal.toFixed(1)}h 予定）</span>
        </div>
      );
    }
    if (weekdayNeededNegative) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">土日の稼働だけで達成できます（平日稼働不要）</span>
        </div>
      );
    }
    if (result.perWeekday === null) {
      return <span className="text-muted">-</span>;
    }
    return (
      <span className="text-3xl font-bold text-blue-400 font-mono tabular-nums">
        {result.perWeekday.toFixed(1)}h
      </span>
    );
  };

  return (
    <div className="space-y-5 bg-card border border-border border-l-2 border-l-green-500 p-5 rounded-md">

      {/* 入力フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>現在の稼働時間 (h)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={currentHours ?? ""}
            onChange={(e) => handleNumberInput(setCurrentHours, e.target.value)}
            className={inputClass}
            placeholder="例: 12"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>上限時間 (h)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={targetHours ?? ""}
            onChange={(e) => handleNumberInput(setTargetHours, e.target.value)}
            className={inputClass}
            placeholder="例: 40"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>土日祝1日の稼働予定 (h)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={weekendHours ?? ""}
            onChange={(e) => handleNumberInput(setWeekendHours, e.target.value)}
            className={inputClass}
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
        <div className="ml-3 text-sm text-muted flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          今日を残り日数に含む
        </div>
      </label>

      {/* 計算結果 */}
      <div className="pt-4 border-t border-border space-y-3">

        {/* 残り稼働時間・日数内訳 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-card-raised border border-border rounded-md">
            <div className="text-xs text-muted mb-1 font-mono">残り稼働時間</div>
            <div className={`text-xl font-bold font-mono tabular-nums ${isOverTarget ? "text-amber-400" : "text-foreground"}`}>
              {!hasTarget ? "-" : `${result.remaining.toFixed(1)}h`}
            </div>
          </div>

          <div className="p-3 bg-card-raised border border-border rounded-md">
            <div className="text-xs text-muted mb-1 font-mono">残り平日</div>
            <div className="text-xl font-bold font-mono text-foreground tabular-nums">
              {result.weekdays}<span className="text-sm font-normal text-muted ml-0.5">日</span>
            </div>
          </div>

          <div className="p-3 bg-card-raised border border-border rounded-md">
            <div className="text-xs text-muted mb-1 font-mono">残り土日祝</div>
            <div className="text-xl font-bold font-mono text-foreground tabular-nums">
              {result.weekends}<span className="text-sm font-normal text-muted ml-0.5">日</span>
            </div>
          </div>
        </div>

        {/* メイン結果：平日1日あたり */}
        <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-md">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            平日1日あたりの必要稼働時間
          </div>
          <div className="text-foreground">
            {renderPerWeekday()}
          </div>
          {!isOverTarget && result.perWeekday !== null && result.weekdayNeeded >= 0 && result.weekdays > 0 && (
            <div className="mt-1 text-xs text-blue-400/70 font-mono">
              土日祝合計 {result.weekendTotal.toFixed(1)}h + 平日 {result.weekdayNeeded.toFixed(1)}h = {result.remaining.toFixed(1)}h
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
