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

  // 通知許可状態の確認
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

  // 定期的なチェック(10秒ごと)
  useEffect(() => {
    if (!notificationsEnabled || permission !== "granted" || !startObj || !estimatedEnd) return;

    const lastNotifiedKey = "work-last-notified";
    
    const checkNotification = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - startObj.getTime();
      const elapsedHour = Math.floor(elapsedMs / (60 * 60 * 1000));
      
      const lastNotifiedData = JSON.parse(window.localStorage.getItem(lastNotifiedKey) || '{"hour": -1, "end": false}');
      
      // 1時間ごとのリマインダー通知
      if (elapsedHour > 0 && lastNotifiedData.hour < elapsedHour && now < estimatedEnd) {
        new Notification("リマインダー", { body: `稼働開始から ${elapsedHour} 時間経過しました。` });
        lastNotifiedData.hour = elapsedHour;
        window.localStorage.setItem(lastNotifiedKey, JSON.stringify(lastNotifiedData));
      }

      // 終了予定時刻の通知
      if (now >= estimatedEnd && !lastNotifiedData.end) {
        new Notification("お疲れ様でした！", { body: "終了予定時刻になりました。" });
        lastNotifiedData.end = true;
        window.localStorage.setItem(lastNotifiedKey, JSON.stringify(lastNotifiedData));
      }

      // 日付が変わったら(または開始時刻が変わったら)リセットするロジックは
      // lastNotifiedKeyに日付を含めるなどで実現できるが、簡略化のため現状はリマインダーデータを上書き
    };

    const interval = setInterval(checkNotification, 10000); // 10秒に一度確認
    return () => clearInterval(interval);
  }, [notificationsEnabled, permission, startObj, estimatedEnd]);

  // 新しく開始時刻がセットされたら、通知管理用データをリセットする
  useEffect(() => {
    if (startTimeStr) {
      window.localStorage.setItem("work-last-notified", '{"hour": -1, "end": false}');
    }
  }, [startTimeStr]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {notificationsEnabled && permission === "granted" ? (
          <BellRing className="w-4 h-4 text-green-500" />
        ) : (
          <BellOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">リマインダー</span>
      </div>
      <button
        onClick={toggleNotifications}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
          notificationsEnabled && permission === "granted"
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        }`}
      >
        {notificationsEnabled && permission === "granted" ? "ON" : "OFF"}
      </button>
    </div>
  );
}
