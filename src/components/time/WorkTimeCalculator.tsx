"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Play, Coffee, Bell } from "lucide-react";

// Helper: "HH:MM" 形式から Date オブジェクトを作成（当日の日付ベース）
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

  // 初回マウントと毎秒更新
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 経過時間計算
  const startObj = useMemo(() => parseTime(startTimeStr), [startTimeStr]);
  const elapsedMs = (startObj && now) ? Math.max(0, now.getTime() - startObj.getTime()) : 0;
  
  // 休憩時間の減算（チェックが入っており、かつ1時間以上経過している場合？）
  // もしくは単純に「休憩ありなら稼働時間から1時間引く」（ただし0未満にしない）
  const breakDeductionMs = includesBreak ? 60 * 60 * 1000 : 0;
  const activeWorkMs = Math.max(0, elapsedMs - breakDeductionMs);

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // 終了予定時刻計算
  const estimatedEnd = useMemo(() => {
    if (!startObj) return null;
    const end = new Date(startObj.getTime());
    // 定時9時間 + オフセット分
    end.setHours(end.getHours() + 9);
    end.setMinutes(end.getMinutes() + offsetMinutes);
    return end;
  }, [startObj, offsetMinutes]);

  const endStr = estimatedEnd ? estimatedEnd.toLocaleTimeString("ja-JP", { hour12: false, hour: '2-digit', minute: '2-digit' }) : "--:--";

  return (
    <div className="space-y-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* 開始時刻入力 */}
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            開始時刻
          </label>
          <div className="flex items-center space-x-2">
            <input 
              type="time" 
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
            <button 
              onClick={handleSetNow}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors"
            >
              現在時刻
            </button>
          </div>
        </div>

        {/* 休憩考慮トグル */}
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={includesBreak}
                onChange={(e) => setIncludesBreak(e.target.checked)}
              />
              <div className={`block w-10 h-6 outline-none rounded-full transition-colors ${includesBreak ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includesBreak ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Coffee className="w-4 h-4" />
              休憩(-1h)
            </div>
          </label>
        </div>
      </div>

      {/* 稼働時間表示 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <Play className="w-4 h-4" /> 経過時間
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {startTimeStr ? formatDuration(elapsedMs) : "-h -m"}
          </div>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
            <Bell className="w-4 h-4" /> 実働時間
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300">
            {startTimeStr ? formatDuration(activeWorkMs) : "-h -m"}
          </div>
        </div>
      </div>

      {/* 終了時刻調整 */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">予定終了時刻</span>
            <span className="ml-3 text-xl font-bold text-foreground font-mono">
              {endStr}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setOffsetMinutes(prev => prev - 30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              -30m
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-center">
              {offsetMinutes >= 0 ? `+${offsetMinutes}` : offsetMinutes}m
            </span>
            <button 
              onClick={() => setOffsetMinutes(prev => prev + 30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              +30m
            </button>
            <button 
              onClick={() => setOffsetMinutes(prev => prev + 60)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              +1h
            </button>
            <button 
              onClick={handleClear}
              className="ml-2 px-3 py-1 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded transition-colors"
              title="開始時刻をクリア"
            >
              リセット
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
