"use client";

import React, { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

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

  const activeTodos = todos.filter((t) => !t.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completedTodos = todos.filter((t) => t.completed).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
      {/* 入力フォーム */}
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* タスクリスト */}
      <div className="space-y-6">
        {/* 未完了タスク */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>未完了 ({activeTodos.length})</span>
          </h3>
          {activeTodos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 italic px-2">タスクはありません</p>
          ) : (
            <ul className="space-y-2">
              {activeTodos.map((todo) => (
                <li 
                  key={todo.id} 
                  className="group flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">{todo.text}</span>
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 完了済みタスク */}
        {completedTodos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <span>完了済み ({completedTodos.length})</span>
            </h3>
            <ul className="space-y-2 opacity-60">
              {completedTodos.map((todo) => (
                <li 
                  key={todo.id} 
                  className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-lg"
                >
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-gray-500 dark:text-gray-400 line-through">{todo.text}</span>
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
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
