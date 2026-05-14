"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NotificationHandler } from "@/components/time/NotificationHandler";
import { Play, Coffee, Bell } from "lucide-react";

const BREAK_DURATION_MS = 60 * 60 * 1000;

function parseTime(timeStr: string): Date | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;

  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function WorkTimeCalculator() {
  const [startTimeStr, setStartTimeStr] = useLocalStorage<string>("work-start-time", "");
  const [includesBreak, setIncludesBreak] = useLocalStorage<boolean>("work-includes-break", true);
  const [offsetMinutes, setOffsetMinutes] = useLocalStorage<number>("work-offset-minutes", 0);

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetNow = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    setStartTimeStr(`${h}:${m}`);
  };

  const handleClear = () => {
    if (window.confirm("開始時刻をクリアしますか？")) {
      setStartTimeStr("");
      setOffsetMinutes(0);
    }
  };

  const startObj = useMemo(() => parseTime(startTimeStr), [startTimeStr]);
  const elapsedMs = (startObj && now) ? Math.max(0, now.getTime() - startObj.getTime()) : 0;

  const activeWorkMs = Math.max(0, elapsedMs - (includesBreak ? BREAK_DURATION_MS : 0));

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const estimatedEnd = useMemo(() => {
    if (!startObj) return null;
    const end = new Date(startObj.getTime());
    end.setHours(end.getHours() + 9);
    end.setMinutes(end.getMinutes() + offsetMinutes);
    return end;
  }, [startObj, offsetMinutes]);

  const endStr = estimatedEnd ? estimatedEnd.toLocaleTimeString("ja-JP", { hour12: false, hour: '2-digit', minute: '2-digit' }) : "--:--";

  const offsetBtnClass = "px-3 py-1 text-xs font-mono bg-muted-bg hover:bg-card-raised border border-border text-foreground rounded-sm transition-colors";

  return (
    <div className="space-y-5 bg-card border border-border border-l-2 border-l-blue-500 p-5 rounded-md">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted uppercase tracking-widest">
          開始時刻
        </label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={startTimeStr}
            onChange={(e) => setStartTimeStr(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 font-mono text-sm"
          />
          <button
            onClick={handleSetNow}
            className="shrink-0 px-4 py-2 bg-blue-950/20 hover:bg-blue-950/30 text-blue-400 font-medium rounded-md border border-blue-900/40 transition-colors text-sm"
          >
            現在時刻
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card-raised border border-border rounded-md">
          <div className="text-xs text-muted mb-1 flex items-center gap-1">
            <Play className="w-3 h-3" /> 経過時間
          </div>
          <div className="text-2xl font-bold font-mono text-foreground tabular-nums">
            {startTimeStr ? formatDuration(elapsedMs) : "-h -m"}
          </div>
        </div>
        <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-md">
          <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
            <Bell className="w-3 h-3" /> 実働時間
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
            {startTimeStr ? formatDuration(activeWorkMs) : "-h -m"}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-widest">予定終了時刻</span>
          <span className="text-xl font-bold text-foreground font-mono tabular-nums">{endStr}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => setOffsetMinutes(prev => prev - 30)} className={offsetBtnClass}>
            -30m
          </button>
          <span className="text-xs font-mono text-muted w-12 text-center">
            {offsetMinutes >= 0 ? `+${offsetMinutes}` : offsetMinutes}m
          </span>
          <button onClick={() => setOffsetMinutes(prev => prev + 30)} className={offsetBtnClass}>
            +30m
          </button>
          <button onClick={() => setOffsetMinutes(prev => prev + 60)} className={offsetBtnClass}>
            +1h
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs font-mono bg-red-950/20 hover:bg-red-950/30 text-red-400 border border-red-900/30 rounded-sm transition-colors"
            title="開始時刻をクリア"
          >
            リセット
          </button>
        </div>

        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={includesBreak}
              onChange={(e) => setIncludesBreak(e.target.checked)}
            />
            <div className={`block w-10 h-6 outline-none rounded-full transition-colors ${includesBreak ? 'bg-blue-500' : 'bg-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includesBreak ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm text-muted flex items-center gap-1">
            <Coffee className="w-4 h-4" />
            休憩(-1h)
          </div>
        </label>
      </div>

      <NotificationHandler />
    </div>
  );
}
