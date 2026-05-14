"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BellRing, BellOff } from "lucide-react";

function parseTime(timeStr: string): Date | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;

  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function NotificationHandler() {
  const [startTimeStr] = useLocalStorage<string>("work-start-time", "");
  const [offsetMinutes] = useLocalStorage<number>("work-offset-minutes", 0);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>("work-notifications-enabled", false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("このブラウザは通知に対応していません");
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") {
      setNotificationsEnabled(true);
      new Notification("Work Dashboard", { body: "通知が有効になりました" });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      if (permission === "granted") {
        setNotificationsEnabled(true);
      } else {
        requestPermission();
      }
    }
  };

  const startObj = useMemo(() => parseTime(startTimeStr), [startTimeStr]);
  const estimatedEnd = useMemo(() => {
    if (!startObj) return null;
    const end = new Date(startObj.getTime());
    end.setHours(end.getHours() + 9);
    end.setMinutes(end.getMinutes() + offsetMinutes);
    return end;
  }, [startObj, offsetMinutes]);

  useEffect(() => {
    if (!notificationsEnabled || permission !== "granted" || !startObj || !estimatedEnd) return;

    const lastNotifiedKey = "work-last-notified";

    const checkNotification = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - startObj.getTime();
      const elapsedHour = Math.floor(elapsedMs / (60 * 60 * 1000));

      const stored = JSON.parse(window.localStorage.getItem(lastNotifiedKey) || "null");
      const lastNotifiedData: { startTime: string; hour: number; end: boolean } =
        stored?.startTime === startTimeStr
          ? stored
          : { startTime: startTimeStr, hour: -1, end: false };

      if (elapsedHour > 0 && lastNotifiedData.hour < elapsedHour && now < estimatedEnd) {
        new Notification("リマインダー", { body: `稼働開始から ${elapsedHour} 時間経過しました。` });
        lastNotifiedData.hour = elapsedHour;
        window.localStorage.setItem(lastNotifiedKey, JSON.stringify(lastNotifiedData));
      }

      if (now >= estimatedEnd && !lastNotifiedData.end) {
        new Notification("お疲れ様でした！", { body: "終了予定時刻になりました。" });
        lastNotifiedData.end = true;
        window.localStorage.setItem(lastNotifiedKey, JSON.stringify(lastNotifiedData));
      }
    };

    const interval = setInterval(checkNotification, 10000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, permission, startObj, estimatedEnd, startTimeStr]);

  const isOn = notificationsEnabled && permission === "granted";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isOn ? (
          <BellRing className="w-4 h-4 text-green-400" />
        ) : (
          <BellOff className="w-4 h-4 text-muted" />
        )}
        <span className="text-xs text-muted">リマインダー</span>
      </div>
      <button
        onClick={toggleNotifications}
        className={`px-2.5 py-1 text-xs font-mono font-medium rounded-sm transition-colors ${
          isOn
            ? "bg-green-950/30 text-green-400 border border-green-900/40"
            : "bg-muted-bg border border-border text-muted"
        }`}
      >
        {isOn ? "ON" : "OFF"}
      </button>
    </div>
  );
}
