import React from "react";
import { auth, signOut } from "@/auth";
import { Clock } from "@/components/time/Clock";
import { WorkTimeCalculator } from "@/components/time/WorkTimeCalculator";
import { NotificationHandler } from "@/components/time/NotificationHandler";
import { BaseDateCounter } from "@/components/task/BaseDateCounter";
import { TodoList } from "@/components/task/TodoList";
import { Translator } from "@/components/tools/Translator";
import { QiitaTrends } from "@/components/tools/QiitaTrends";

export default async function Home() {
  const session = await auth();

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
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {session?.user?.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-foreground bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
