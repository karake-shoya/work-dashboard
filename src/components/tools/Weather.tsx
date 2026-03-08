"use client";

import React, { useState, useEffect } from "react";
import { MapPin, RefreshCw, Loader2 } from "lucide-react";

type WeatherData = {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    time: string[];
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

const DAY_LABELS = ["今日", "明日", "明後日"];

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async (lat: number, lon: number) => {
    const [weatherRes, geoRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`
      ),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`
      ),
    ]);

    if (!weatherRes.ok) throw new Error("天気データの取得に失敗しました");

    const weatherData = await weatherRes.json();
    setWeather(weatherData);

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      setCity(
        geoData.address?.city ??
        geoData.address?.town ??
        geoData.address?.county ??
        ""
      );
    }
  };

  const load = () => {
    setIsLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("位置情報が利用できません");
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await fetchWeather(coords.latitude, coords.longitude);
        } catch {
          setError("天気の取得に失敗しました");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("位置情報の取得が拒否されました");
        setIsLoading(false);
      }
    );
  };

  useEffect(() => { load(); }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg">
        {error}
      </div>
    );
  }

  if (!weather) return null;

  const current = getWeatherInfo(weather.current.weather_code);

  return (
    <div className="space-y-3">
      {/* 現在の天気 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{current.emoji}</span>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {Math.round(weather.current.temperature_2m)}°C
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{current.label}</div>
          </div>
        </div>
        <div className="text-right space-y-1">
          {city && (
            <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              {city}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            風速 {Math.round(weather.current.wind_speed_10m)} km/h
          </div>
          <button
            onClick={load}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="更新"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3日間予報 */}
      <div className="grid grid-cols-3 gap-2">
        {DAY_LABELS.map((label, i) => {
          const info = getWeatherInfo(weather.daily.weather_code[i]);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              <span className="text-lg">{info.emoji}</span>
              <div className="text-xs font-medium text-foreground">
                {Math.round(weather.daily.temperature_2m_max[i])}°
                <span className="text-gray-400 dark:text-gray-600 mx-0.5">/</span>
                <span className="text-gray-400 dark:text-gray-500">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
