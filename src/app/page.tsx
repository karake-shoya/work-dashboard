import React from "react";
import { Clock } from "@/components/time/Clock";
import { WorkTimeCalculator } from "@/components/time/WorkTimeCalculator";
import { NotificationHandler } from "@/components/time/NotificationHandler";
import { BaseDateCounter } from "@/components/task/BaseDateCounter";
import { TodoList } from "@/components/task/TodoList";
import { Translator } from "@/components/tools/Translator";
import { QiitaTrends } from "@/components/tools/QiitaTrends";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Work Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Your daily frontend-only workspace
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {/* ここに全体のステータスや設定ボタンなどを置く */}
          </div>
        </header>

        {/* 
          1カラム（スマホ） -> 2カラム（PC）のグリッドレイアウト 
          左側: 時間管理、タスク・進捗管理 (幅を少し広く取る)
          右側: ツール類 (翻訳、Qiitaトレンドなど)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側のカラム: 時間管理、タスク管理 */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-card text-card-foreground rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-800">
                Time Management
              </h2>
              <Clock />
              <WorkTimeCalculator />
              <NotificationHandler />
            </section>

            <section className="bg-card text-card-foreground rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-800">
                Progress & Tasks
              </h2>
              <BaseDateCounter />
              <TodoList />
            </section>
          </div>

          {/* 右側のカラム: ツール類 */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-card text-card-foreground rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-800">
                Tools
              </h2>
              <Translator />
              <QiitaTrends />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
