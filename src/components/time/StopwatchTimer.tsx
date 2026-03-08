"use client";

import React, { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Flag } from "lucide-react";

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return {
    main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    sub: String(centiseconds).padStart(2, "0"),
  };
}

export function StopwatchTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const baseElapsedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    startTimeRef.current = performance.now();
    const tick = () => {
      setElapsed(baseElapsedRef.current + (performance.now() - startTimeRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning]);

  const toggle = () => {
    if (isRunning) {
      baseElapsedRef.current += performance.now() - startTimeRef.current;
    }
    setIsRunning((r) => !r);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    baseElapsedRef.current = 0;
  };

  const lap = () => {
    if (!isRunning) return;
    setLaps((prev) => [elapsed, ...prev]);
  };

  const { main, sub } = formatTime(elapsed);
  const lastLapElapsed = laps.length > 0 ? elapsed - laps[0] : elapsed;
  const { main: lapMain, sub: lapSub } = formatTime(lastLapElapsed);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">ストップウォッチ</h3>
      </div>

      {/* タイマー表示 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-bold font-mono text-foreground tracking-wider">{main}</span>
            <span className="text-2xl font-bold font-mono text-gray-400 dark:text-gray-500 mb-1">.{sub}</span>
          </div>
          {laps.length > 0 && (
            <div className="mt-1 text-sm font-mono text-gray-400 dark:text-gray-500">
              ラップ +{lapMain}.{lapSub}
            </div>
          )}
        </div>

        {/* コントロール */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              isRunning
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "停止" : "開始"}
          </button>
          <button
            onClick={lap}
            disabled={!isRunning}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            ラップ
          </button>
          <button
            onClick={reset}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* ラップ一覧 */}
        {laps.length > 0 && (
          <div className="w-full max-h-28 overflow-y-auto space-y-1">
            {laps.map((lapMs, i) => {
              const prev = i < laps.length - 1 ? laps[i + 1] : 0;
              const { main: lm, sub: ls } = formatTime(lapMs - prev);
              const { main: tm, sub: ts } = formatTime(lapMs);
              return (
                <div key={i} className="flex items-center justify-between px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded text-xs font-mono">
                  <span className="text-gray-400 dark:text-gray-500">Lap {laps.length - i}</span>
                  <span className="text-gray-600 dark:text-gray-400">{lm}.{ls}</span>
                  <span className="text-gray-400 dark:text-gray-500">{tm}.{ts}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
