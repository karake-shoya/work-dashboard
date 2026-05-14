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
    const days = differenceInDays(now, baseDate);
    const months = differenceInMonths(now, baseDate);

    const dateAfterMonths = new Date(baseDate);
    dateAfterMonths.setMonth(dateAfterMonths.getMonth() + months);
    const remainingDays = differenceInDays(now, dateAfterMonths);

    return { days, months, remainingDays };
  }, [baseDateStr]);

  return (
    <div className="bg-card border border-border border-l-2 border-l-purple-500 p-5 rounded-md space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          基準日
        </label>
        <input
          type="date"
          value={baseDateStr}
          onChange={(e) => setBaseDateStr(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 font-mono text-xs"
        />
      </div>

      {stats ? (
        <div className="flex items-center gap-5 p-4 bg-card-raised border border-border rounded-md">
          <Flag className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              基準日からの経過
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-foreground tabular-nums">
                {Math.max(0, stats.days)}<span className="text-lg font-medium text-muted ml-1">日目</span>
              </span>
              <span className="text-xs text-muted font-mono">
                （{Math.max(0, stats.months)}ヶ月と{Math.max(0, stats.remainingDays)}日）
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-muted bg-muted-bg rounded-md border border-dashed border-border">
          基準日を設定すると経過日数が表示されます
        </div>
      )}
    </div>
  );
}
