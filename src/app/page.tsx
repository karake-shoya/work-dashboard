import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkTimeCalculator } from "@/components/time/WorkTimeCalculator";
import { PomodoroTimer } from "@/components/time/PomodoroTimer";
import { StopwatchTimer } from "@/components/time/StopwatchTimer";
import { BaseDateCounter } from "@/components/task/BaseDateCounter";
import { TodoList } from "@/components/task/TodoList";
import { Translator } from "@/components/tools/Translator";
import { QiitaTrends } from "@/components/tools/QiitaTrends";
import { Memo } from "@/components/memo/Memo";
import { SideJobCalculator } from "@/components/side-job/SideJobCalculator";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* モバイル用トップヘッダー */}
      <header className="lg:hidden flex items-center gap-2 px-4 py-3 bg-background border-b border-border sticky top-0 z-30">
        <LayoutDashboard className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-bold text-foreground">Work Dashboard</span>
      </header>

      <main className="lg:ml-60 p-4 md:p-6 space-y-8">

        {/* 時間管理 */}
        <section id="time-management" className="scroll-mt-4 space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest border-b border-border pb-2 border-l-2 border-l-blue-500 pl-3">
            Time Management
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
            <WorkTimeCalculator />
            <PomodoroTimer />
            <StopwatchTimer />
          </div>
        </section>

        {/* タスク・進捗 */}
        <section id="tasks" className="scroll-mt-4 space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest border-b border-border pb-2 border-l-2 border-l-purple-500 pl-3">
            Progress & Tasks
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BaseDateCounter />
            <TodoList />
          </div>
        </section>

        {/* メモ */}
        <section id="memo" className="scroll-mt-4">
          <Memo />
        </section>

        {/* 副業管理 */}
        <section id="side-job" className="scroll-mt-4 space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest border-b border-border pb-2 border-l-2 border-l-green-500 pl-3">
            副業管理
          </h2>
          <SideJobCalculator />
        </section>

        {/* ツール */}
        <section id="tools" className="scroll-mt-4 space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest border-b border-border pb-2 border-l-2 border-l-sky-500 pl-3">
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
