"use client";

import React, { useState, useEffect } from "react";

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
      <div className="space-y-1 animate-pulse">
        <div className="w-28 h-5 bg-border rounded-sm"></div>
        <div className="w-20 h-3 bg-border rounded-sm ml-0"></div>
      </div>
    );
  }

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
      <div className="text-lg font-bold font-mono tracking-wider text-foreground tabular-nums">
        {timeString}
      </div>
      <div className="text-xs text-muted font-mono">{dateString}</div>
    </div>
  );
}
