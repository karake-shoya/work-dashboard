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
import { LayoutDashboard } from "lucide-react";

function SectionHeading({ title, accent }: { title: string; accent: string }) {
  return (
    <h2 className={`text-xs font-semibold text-muted uppercase tracking-widest border-b border-border pb-2 border-l-2 pl-3 ${accent}`}>
      {title}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <header className="lg:hidden flex items-center gap-2 px-4 py-3 bg-background border-b border-border sticky top-0 z-30">
        <LayoutDashboard className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-bold text-foreground">Work Dashboard</span>
      </header>

      <main className="lg:ml-60 p-4 md:p-6 space-y-8">

        <section id="time-management" className="scroll-mt-4 space-y-4">
          <SectionHeading title="Time Management" accent="border-l-blue-500" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
            <WorkTimeCalculator />
            <PomodoroTimer />
            <StopwatchTimer />
          </div>
        </section>

        <section id="tasks" className="scroll-mt-4 space-y-4">
          <SectionHeading title="Progress & Tasks" accent="border-l-purple-500" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BaseDateCounter />
            <TodoList />
          </div>
        </section>

        <section id="memo" className="scroll-mt-4">
          <Memo />
        </section>

        <section id="tools" className="scroll-mt-4 space-y-4">
          <SectionHeading title="Tools" accent="border-l-sky-500" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Translator />
            <QiitaTrends />
          </div>
        </section>

      </main>
    </div>
  );
}
