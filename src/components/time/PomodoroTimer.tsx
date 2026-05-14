"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, Coffee, Settings, PictureInPicture2 } from "lucide-react";
import { usePiP } from "@/hooks/usePiP";

type Mode = "work" | "break";

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const PIP_SIZES = [
  { label: "S", width: 260, height: 200 },
  { label: "M", width: 340, height: 260 },
  { label: "L", width: 460, height: 340 },
];

const MODE_CONFIG = {
  work:  { label: "作業中", accent: "text-orange-400", btn: "bg-orange-500 hover:bg-orange-400", tab: "bg-orange-950/30 text-orange-400 border border-orange-900/40", pip: "bg-orange-950/30 text-orange-400", stroke: "stroke-orange-500" },
  break: { label: "休憩中", accent: "text-green-400",  btn: "bg-green-500 hover:bg-green-400",   tab: "bg-green-950/30 text-green-400 border border-green-900/40",   pip: "bg-green-950/30 text-green-400",   stroke: "stroke-green-500"  },
} satisfies Record<Mode, { label: string; accent: string; btn: string; tab: string; pip: string; stroke: string }>;

function PiPContent({
  minutes, seconds, mode, isRunning, sessions, onToggle, onReset, onResize,
}: {
  minutes: number;
  seconds: number;
  mode: Mode;
  isRunning: boolean;
  sessions: number;
  onToggle: () => void;
  onReset: () => void;
  onResize: (width: number, height: number) => void;
}) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div className="bg-background h-full flex flex-col items-center justify-center gap-3 p-4">
      <span className={`text-xs font-medium uppercase tracking-widest ${cfg.accent}`}>
        {cfg.label}
      </span>
      <span className="text-5xl font-bold font-mono text-foreground tracking-wider tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-md text-white transition-colors ${cfg.btn}`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? "一時停止" : "開始"}
        </button>
        <button
          onClick={onReset}
          className="p-1.5 text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors"
          title="リセット"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-xs text-muted">
        <span className="font-bold font-mono text-foreground">{sessions}</span> 回完了
      </span>
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

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleFinishRef = useRef<() => void>(() => {});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUnlockingRef = useRef(false);

  const { isPiP, openPiP, updatePiP, resizePiP, closePiP } = usePiP();

  const totalSeconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const progress = (secondsLeft / totalSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // ブラウザの自動再生ポリシーによりタイマー完了時の再生がブロックされるのを防ぐ
  const unlockAudio = useCallback(() => {
    if (audioRef.current || isUnlockingRef.current) return;
    isUnlockingRef.current = true;
    const audio = new Audio("/timer-complete.m4a");
    audio.volume = 0;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      audioRef.current = audio;
    }).catch(() => {
      isUnlockingRef.current = false;
    });
  }, []);

  const playSound = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    unlockAudio();
    setIsRunning((r) => !r);
  }, [unlockAudio]);

  const notify = useCallback((title: string, body: string) => {
    playSound();
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, [playSound]);

  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
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

  // handleFinish を ref に保持し、インターバルコールバックから安全に呼び出す
  useEffect(() => {
    handleFinishRef.current = () => {
      if (mode === "work") {
        setSessions((s) => s + 1);
        notify("お疲れ様です！", `${workMinutes}分経過しました。休憩しましょう。`);
        switchMode("break");
      } else {
        notify("休憩終了", "作業を再開しましょう。");
        switchMode("work");
      }
    };
  }, [mode, notify, switchMode, workMinutes]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimeout(() => handleFinishRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(mode === "work" ? workMinutes * 60 : breakMinutes * 60);
  }, [mode, workMinutes, breakMinutes]);

  useEffect(() => {
    if (!isPiP) return;
    updatePiP(
      <PiPContent
        minutes={minutes}
        seconds={seconds}
        mode={mode}
        isRunning={isRunning}
        sessions={sessions}
        onToggle={handleToggle}
        onReset={reset}
        onResize={resizePiP}
      />
    );
  }, [isPiP, minutes, seconds, mode, isRunning, sessions, updatePiP, reset, handleToggle]);

  const handleOpenPiP = async () => {
    const w = Math.min(Math.round(window.innerWidth * 0.3), 500);
    const h = Math.min(Math.round(window.innerHeight * 0.4), 400);
    await openPiP(
      <PiPContent
        minutes={minutes}
        seconds={seconds}
        mode={mode}
        isRunning={isRunning}
        sessions={sessions}
        onToggle={handleToggle}
        onReset={reset}
        onResize={resizePiP}
      />,
      { width: w, height: h }
    );
  };

  const handleMinutesChange = (targetMode: Mode, value: number) => {
    const clamped = Math.min(99, Math.max(1, value));
    if (targetMode === "work") {
      setWorkMinutes(clamped);
      if (mode === "work" && !isRunning) setSecondsLeft(clamped * 60);
    } else {
      setBreakMinutes(clamped);
      if (mode === "break" && !isRunning) setSecondsLeft(clamped * 60);
    }
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="bg-card border border-border border-l-2 border-l-orange-500 p-5 rounded-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-orange-400" />
          ポモドーロ
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchMode("work")}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "work" ? MODE_CONFIG.work.tab : "text-muted hover:bg-muted-bg"
            }`}
          >
            作業
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "break" ? MODE_CONFIG.break.tab : "text-muted hover:bg-muted-bg"
            }`}
          >
            <Coffee className="w-3 h-3 inline mr-1" />
            休憩
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className={`p-1.5 rounded-sm transition-colors ${
              showSettings ? "bg-muted-bg text-foreground" : "text-muted hover:bg-muted-bg hover:text-foreground"
            }`}
            title="時間設定"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={isPiP ? closePiP : handleOpenPiP}
            className={`p-1.5 rounded-sm transition-colors ${isPiP ? cfg.pip : "text-muted hover:bg-muted-bg hover:text-foreground"}`}
            title={isPiP ? "PiPを閉じる" : "ピクチャーインピクチャーで開く"}
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-card-raised border border-border rounded-md flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted whitespace-nowrap">作業</span>
            <input
              type="number"
              min={1}
              max={99}
              value={workMinutes}
              disabled={isRunning}
              onChange={(e) => handleMinutesChange("work", Number(e.target.value))}
              className="w-14 px-2 py-1 text-xs text-center border border-border rounded-sm bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            />
            <span className="text-xs text-muted">分</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted whitespace-nowrap">休憩</span>
            <input
              type="number"
              min={1}
              max={99}
              value={breakMinutes}
              disabled={isRunning}
              onChange={(e) => handleMinutesChange("break", Number(e.target.value))}
              className="w-14 px-2 py-1 text-xs text-center border border-border rounded-sm bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            />
            <span className="text-xs text-muted">分</span>
          </div>
          {isRunning && (
            <span className="text-xs text-muted ml-auto">タイマー停止中のみ変更可</span>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-44 h-44">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" strokeWidth="6" stroke="var(--border)" />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${cfg.stroke}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-bold font-mono text-foreground tracking-wider tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className={`text-xs uppercase tracking-widest font-medium ${cfg.accent}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              handleToggle();
              await requestNotificationPermission();
            }}
            className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-md transition-colors ${cfg.btn} text-white`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "一時停止" : "開始"}
          </button>
          <button
            onClick={reset}
            className="p-2 text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted font-mono">
            <span className="font-bold text-foreground">{sessions}</span> 回完了
          </span>
        </div>
      </div>
    </div>
  );
}
