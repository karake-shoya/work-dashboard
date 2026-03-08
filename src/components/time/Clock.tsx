"use client";

import React, { useState, useEffect } from "react";
import { Clock as ClockIcon } from "lucide-react";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ現在時刻をセット（Hydrationエラー防止）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center space-x-2 text-foreground h-8 animate-pulse">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // 日本標準時前提として、HH:MM:SS形式にフォーマット
  const timeString = time.toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateString = time.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2 text-foreground">
        <ClockIcon className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-lg font-bold font-mono tracking-wider">{timeString}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">{dateString}</div>
    </div>
  );
}
