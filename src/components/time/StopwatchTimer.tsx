"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, Flag, PictureInPicture2 } from "lucide-react";
import { usePiP } from "@/hooks/usePiP";

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return {
    main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    sub: String(centiseconds).padStart(2, "0"),
  };
}

const PIP_SIZES = [
  { label: "S", width: 260, height: 180 },
  { label: "M", width: 340, height: 220 },
  { label: "L", width: 460, height: 300 },
];

function PiPContent({
  elapsed, isRunning, laps, onToggle, onLap, onReset, onResize,
}: {
  elapsed: number;
  isRunning: boolean;
  laps: number[];
  onToggle: () => void;
  onLap: () => void;
  onReset: () => void;
  onResize: (width: number, height: number) => void;
}) {
  const { main, sub } = formatTime(elapsed);
  const lastLapElapsed = laps.length > 0 ? elapsed - laps[0] : elapsed;
  const { main: lapMain, sub: lapSub } = formatTime(lastLapElapsed);

  return (
    <div className="bg-white dark:bg-gray-900 h-full flex flex-col items-center justify-center gap-3 p-4">
      <div className="text-center">
        <div className="flex items-end justify-center gap-1">
          <span className="text-4xl font-bold font-mono text-foreground tracking-wider">{main}</span>
          <span className="text-xl font-bold font-mono text-gray-400 dark:text-gray-500 mb-0.5">.{sub}</span>
        </div>
        {laps.length > 0 && (
          <div className="mt-1 text-xs font-mono text-gray-400 dark:text-gray-500">
            ラップ +{lapMain}.{lapSub}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? "停止" : "開始"}
        </button>
        <button
          onClick={onLap}
          disabled={!isRunning}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        {PIP_SIZES.map((s) => (
          <button
            key={s.label}
            onClick={() => onResize(s.width, s.height)}
            className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StopwatchTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const baseElapsedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const { isPiP, openPiP, updatePiP, resizePiP, closePiP } = usePiP();

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

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    baseElapsedRef.current = 0;
  }, []);

  const lap = useCallback(() => {
    if (!isRunning) return;
    setLaps((prev) => [elapsed, ...prev]);
  }, [isRunning, elapsed]);

  // PiPウィンドウのコンテンツを更新
  useEffect(() => {
    if (!isPiP) return;
    updatePiP(
      <PiPContent
        elapsed={elapsed}
        isRunning={isRunning}
        laps={laps}
        onToggle={toggle}
        onLap={lap}
        onReset={reset}
        onResize={resizePiP}
      />
    );
  }, [isPiP, elapsed, isRunning, laps, updatePiP, lap, reset]);

  const handleOpenPiP = () => {
    const w = Math.min(Math.round(window.innerWidth * 0.3), 500);
    const h = Math.min(Math.round(window.innerHeight * 0.35), 350);
    openPiP(
      <PiPContent
        elapsed={elapsed}
        isRunning={isRunning}
        laps={laps}
        onToggle={toggle}
        onLap={lap}
        onReset={reset}
        onResize={resizePiP}
      />,
      { width: w, height: h }
    );
  };

  const { main, sub } = formatTime(elapsed);
  const lastLapElapsed = laps.length > 0 ? elapsed - laps[0] : elapsed;
  const { main: lapMain, sub: lapSub } = formatTime(lastLapElapsed);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">ストップウォッチ</h3>
        </div>
        <button
          onClick={isPiP ? closePiP : handleOpenPiP}
          className={`p-1.5 rounded-md transition-colors ${
            isPiP
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title={isPiP ? "PiPを閉じる" : "ピクチャーインピクチャーで開く"}
        >
          <PictureInPicture2 className="w-3.5 h-3.5" />
        </button>
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
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
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
