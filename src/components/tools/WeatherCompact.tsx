"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Loader2, RefreshCw } from "lucide-react";

type WeatherCurrent = {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
};

function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "快晴" };
  if (code <= 3) return { emoji: "🌤️", label: "晴れ" };
  if (code <= 48) return { emoji: "🌫️", label: "霧" };
  if (code <= 55) return { emoji: "🌦️", label: "霧雨" };
  if (code <= 65) return { emoji: "🌧️", label: "雨" };
  if (code <= 75) return { emoji: "❄️", label: "雪" };
  if (code <= 82) return { emoji: "🌧️", label: "にわか雨" };
  if (code <= 86) return { emoji: "🌨️", label: "にわか雪" };
  return { emoji: "⛈️", label: "雷雨" };
}

export function WeatherCompact() {
  const [data, setData] = useState<WeatherCurrent | null>(null);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setIsLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("位置情報なし");
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`),
          ]);
          if (!weatherRes.ok) throw new Error();
          setData(await weatherRes.json());
          if (geoRes.ok) {
            const geo = await geoRes.json();
            setCity(geo.address?.city ?? geo.address?.town ?? geo.address?.county ?? "");
          }
        } catch {
          setError("取得失敗");
        } finally {
          setIsLoading(false);
        }
      },
      () => { setError("位置情報が拒否されました"); setIsLoading(false); }
    );
  };

  useEffect(() => { load(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>取得中...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{error || "データなし"}</span>
        <button onClick={load} className="hover:text-blue-500 transition-colors ml-auto">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const info = getWeatherInfo(data.current.weather_code);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{info.emoji}</span>
      <span className="text-sm font-bold font-mono text-foreground">
        {Math.round(data.current.temperature_2m)}°C
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{info.label}</span>
      {city && (
        <span className="flex items-center gap-0.5 text-xs text-gray-400 truncate ml-auto">
          <MapPin className="w-3 h-3 shrink-0" />
          {city}
        </span>
      )}
    </div>
  );
}
