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
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-card border-r border-border z-40">
      {/* ロゴ */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold text-foreground tracking-widest uppercase">Work Dashboard</span>
        </div>
      </div>

      {/* 時計 */}
      <div className="px-4 py-3 border-b border-border">
        <Clock />
      </div>

      {/* 天気 */}
      <div className="px-4 py-3 border-b border-border">
        <WeatherCompact />
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-muted-bg rounded-md transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </a>
        ))}
      </nav>

      {/* ユーザー情報 + ログアウト */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2 min-w-0 mb-3">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-7 h-7 rounded-full shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted truncate">{session?.user?.email}</p>
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
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-red-400 hover:bg-red-950/20 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
