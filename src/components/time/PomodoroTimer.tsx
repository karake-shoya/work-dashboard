"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, Coffee, Settings } from "lucide-react";

type Mode = "work" | "break";

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const progress = (secondsLeft / totalSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const notify = useCallback((title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, []);

  const switchMode = useCallback(
    (next: Mode) => {
      setMode(next);
      setSecondsLeft(next === "work" ? workMinutes * 60 : breakMinutes * 60);
      setIsRunning(false);
    },
    [workMinutes, breakMinutes]
  );

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (mode === "work") {
            setSessions((s) => s + 1);
            notify("お疲れ様です！", `${workMinutes}分経過しました。休憩しましょう。`);
            switchMode("break");
          } else {
            notify("休憩終了", "作業を再開しましょう。");
            switchMode("work");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, notify, switchMode, workMinutes]);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "work" ? workMinutes * 60 : breakMinutes * 60);
  };

  const handleWorkMinutesChange = (value: number) => {
    const clamped = Math.min(99, Math.max(1, value));
    setWorkMinutes(clamped);
    if (mode === "work" && !isRunning) {
      setSecondsLeft(clamped * 60);
    }
  };

  const handleBreakMinutesChange = (value: number) => {
    const clamped = Math.min(99, Math.max(1, value));
    setBreakMinutes(clamped);
    if (mode === "break" && !isRunning) {
      setSecondsLeft(clamped * 60);
    }
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-500" />
          ポモドーロタイマー
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchMode("work")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "work"
                ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            作業
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "break"
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Coffee className="w-3 h-3 inline mr-1" />
            休憩
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className={`p-1.5 rounded-md transition-colors ${
              showSettings
                ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="時間設定"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">作業</span>
            <input
              type="number"
              min={1}
              max={99}
              value={workMinutes}
              disabled={isRunning}
              onChange={(e) => handleWorkMinutesChange(Number(e.target.value))}
              className="w-14 px-2 py-1 text-xs text-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-400">分</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">休憩</span>
            <input
              type="number"
              min={1}
              max={99}
              value={breakMinutes}
              disabled={isRunning}
              onChange={(e) => handleBreakMinutesChange(Number(e.target.value))}
              className="w-14 px-2 py-1 text-xs text-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-400">分</span>
          </div>
          {isRunning && (
            <span className="text-xs text-gray-400 ml-auto">タイマー停止中のみ変更可</span>
          )}
        </div>
      )}

      {/* 円形プログレス（拡大・中央） */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-44 h-44">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${
                mode === "work" ? "stroke-orange-500" : "stroke-green-500"
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-bold font-mono text-foreground tracking-wider">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {mode === "work" ? "作業中" : "休憩中"}
            </span>
          </div>
        </div>

        {/* コントロール */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "work"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "一時停止" : "開始"}
          </button>
          <button
            onClick={reset}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-bold text-foreground">{sessions}</span> 回完了
          </span>
        </div>
      </div>
    </div>
  );
}
