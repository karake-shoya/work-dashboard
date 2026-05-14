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
    <div className="bg-background h-full flex flex-col items-center justify-center gap-3 p-4">
      <div className="text-center">
        <div className="flex items-end justify-center gap-1">
          <span className="text-4xl font-bold font-mono text-foreground tracking-wider tabular-nums">{main}</span>
          <span className="text-xl font-bold font-mono text-muted mb-0.5">.{sub}</span>
        </div>
        {laps.length > 0 && (
          <div className="mt-1 text-xs font-mono text-muted">
            ラップ +{lapMain}.{lapSub}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? "停止" : "開始"}
        </button>
        <button
          onClick={onLap}
          disabled={!isRunning}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-muted-bg hover:bg-card-raised border border-border text-foreground rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        {PIP_SIZES.map((s) => (
          <button
            key={s.label}
            onClick={() => onResize(s.width, s.height)}
            className="px-2 py-0.5 text-xs text-muted hover:text-foreground hover:bg-muted-bg rounded-sm transition-colors font-mono"
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
  const lastPiPUpdateRef = useRef<number>(0);

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

  const toggle = useCallback(() => {
    if (isRunning) {
      baseElapsedRef.current += performance.now() - startTimeRef.current;
    }
    setIsRunning((r) => !r);
  }, [isRunning]);

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

  // PiP の更新は 100ms に間引く（rAF の 60fps を全部 root.render に渡さない）
  useEffect(() => {
    if (!isPiP) return;
    const now = performance.now();
    if (now - lastPiPUpdateRef.current < 100) return;
    lastPiPUpdateRef.current = now;
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
  }, [isPiP, elapsed, isRunning, laps, updatePiP, lap, reset, toggle]);

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
    <div className="bg-card border border-border border-l-2 border-l-sky-500 p-5 rounded-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs font-semibold text-muted uppercase tracking-widest">ストップウォッチ</h3>
        </div>
        <button
          onClick={isPiP ? closePiP : handleOpenPiP}
          className={`p-1.5 rounded-sm transition-colors ${
            isPiP ? "bg-blue-950/30 text-blue-400" : "text-muted hover:bg-muted-bg hover:text-foreground"
          }`}
          title={isPiP ? "PiPを閉じる" : "ピクチャーインピクチャーで開く"}
        >
          <PictureInPicture2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-bold font-mono text-foreground tracking-wider tabular-nums">{main}</span>
            <span className="text-2xl font-bold font-mono text-muted mb-1">.{sub}</span>
          </div>
          {laps.length > 0 && (
            <div className="mt-1 text-sm font-mono text-muted">
              ラップ +{lapMain}.{lapSub}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "停止" : "開始"}
          </button>
          <button
            onClick={lap}
            disabled={!isRunning}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-muted-bg hover:bg-card-raised border border-border text-foreground rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            ラップ
          </button>
          <button
            onClick={reset}
            className="p-2 text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {laps.length > 0 && (
          <div className="w-full max-h-28 overflow-y-auto">
            {laps.map((lapMs, i) => {
              const prev = i < laps.length - 1 ? laps[i + 1] : 0;
              const { main: lm, sub: ls } = formatTime(lapMs - prev);
              const { main: tm, sub: ts } = formatTime(lapMs);
              return (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 border-b border-border text-xs font-mono last:border-b-0">
                  <span className="text-muted">Lap {laps.length - i}</span>
                  <span className="text-foreground tabular-nums">{lm}.{ls}</span>
                  <span className="text-muted tabular-nums">{tm}.{ts}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
