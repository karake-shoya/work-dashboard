import React from "react";
import Link from "next/link";
import { signOut } from "@/auth";
import { Clock } from "@/components/time/Clock";
import { WeatherCompact } from "@/components/tools/WeatherCompact";
import { LayoutDashboard, Timer, ListTodo, FileText, Wrench, BookOpen, Briefcase, LogOut } from "lucide-react";
import { auth } from "@/auth";

const NAV_ITEMS = [
  { href: "#time-management", icon: Timer,     label: "時間管理" },
  { href: "#tasks",           icon: ListTodo,  label: "タスク"   },
  { href: "#memo",            icon: FileText,  label: "メモ"     },
  { href: "#side-job",        icon: Briefcase, label: "副業管理" },
  { href: "#tools",           icon: Wrench,    label: "ツール"   },
  { href: "/qiita",           icon: BookOpen,  label: "Qiita"    },
] as const;

export async function Sidebar() {
  const session = await auth();

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-card border-r border-gray-200 dark:border-gray-800 z-40">
      {/* ロゴ */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="text-sm font-bold text-foreground tracking-tight">Work Dashboard</span>
        </div>
      </div>

      {/* 時計 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Clock />
      </div>

      {/* 天気 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <WeatherCompact />
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </a>
        ))}
      </nav>

      {/* ユーザー情報 + ログアウト */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 min-w-0 mb-3">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-8 h-8 rounded-full shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
