import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkTimeCalculator } from "@/components/time/WorkTimeCalculator";
import { NotificationHandler } from "@/components/time/NotificationHandler";
import { PomodoroTimer } from "@/components/time/PomodoroTimer";
import { BaseDateCounter } from "@/components/task/BaseDateCounter";
import { TodoList } from "@/components/task/TodoList";
import { Translator } from "@/components/tools/Translator";
import { QiitaTrends } from "@/components/tools/QiitaTrends";
import { Memo } from "@/components/memo/Memo";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* モバイル用トップヘッダー */}
      <header className="lg:hidden flex items-center gap-2 px-4 py-3 bg-card border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <LayoutDashboard className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-bold text-foreground">Work Dashboard</span>
      </header>

      <main className="lg:ml-60 p-4 md:p-6 space-y-8 max-w-5xl">

        {/* 時間管理 */}
        <section id="time-management" className="scroll-mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-gray-200 dark:border-gray-800 pb-2">
            Time Management
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WorkTimeCalculator />
            <PomodoroTimer />
          </div>
          <NotificationHandler />
        </section>

        {/* タスク・進捗 */}
        <section id="tasks" className="scroll-mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-gray-200 dark:border-gray-800 pb-2">
            Progress & Tasks
          </h2>
          <BaseDateCounter />
          <TodoList />
        </section>

        {/* メモ */}
        <section id="memo" className="scroll-mt-4">
          <Memo />
        </section>

        {/* ツール */}
        <section id="tools" className="scroll-mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-gray-200 dark:border-gray-800 pb-2">
            Tools
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Translator />
            <QiitaTrends />
          </div>
        </section>

      </main>
    </div>
  );
}
