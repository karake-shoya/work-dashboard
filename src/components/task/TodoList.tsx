"use client";

import React, { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

const deleteBtnCls = "p-1.5 text-muted hover:text-red-400 hover:bg-red-950/20 rounded-sm transition-colors opacity-0 group-hover:opacity-100";

export function TodoList() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("work-todos", []);
  const [inputValue, setInputValue] = useState("");

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const activeTodos = useMemo(
    () => todos.filter((t) => !t.completed).sort((a, b) => b.createdAt - a.createdAt),
    [todos]
  );
  const completedTodos = useMemo(
    () => todos.filter((t) => t.completed).sort((a, b) => b.createdAt - a.createdAt),
    [todos]
  );

  return (
    <div className="bg-card border border-border border-l-2 border-l-indigo-500 p-5 rounded-md space-y-4">
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 font-mono text-sm transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-widest">
            未完了 ({activeTodos.length})
          </h3>
          {activeTodos.length === 0 ? (
            <p className="text-sm text-muted italic px-2">タスクはありません</p>
          ) : (
            <ul className="space-y-1.5">
              {activeTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center justify-between p-3 bg-card-raised border border-border rounded-md hover:border-foreground/20 transition-colors"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <Circle className="w-4 h-4 text-muted group-hover:text-foreground transition-colors shrink-0" />
                    <span className="text-sm text-foreground">{todo.text}</span>
                  </button>
                  <button onClick={() => deleteTodo(todo.id)} className={deleteBtnCls}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {completedTodos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest border-t border-border pt-4">
              完了済み ({completedTodos.length})
            </h3>
            <ul className="space-y-1.5 opacity-50">
              {completedTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center justify-between p-3 bg-muted-bg border border-border rounded-md"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-muted line-through">{todo.text}</span>
                  </button>
                  <button onClick={() => deleteTodo(todo.id)} className={deleteBtnCls}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
