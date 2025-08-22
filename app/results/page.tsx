"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Summary = {
  id: string;
  article_title: string;
  summary: string;
  user_input: string;
  created_at: string;
};

export default function ResultsPage() {
  const [results, setResults] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    const { data } = await supabase
      .from("summaries")
      .select("*")
      .order("created_at", { ascending: false });
    setResults(data || []);
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("summaries").delete().eq("id", id);
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  if (isLoading) {
    return (
      <main className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </main>
    );
  }

  // formating created_at
  const americanFormatter = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Results</h1>

      <table className="min-w-full border border-gray-200 text-sm">
        <thead>
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Article</th>
            <th className="p-2 border">User Input</th>
            <th className="p-2 border">Summary</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={r.id}>
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border font-medium">{r.article_title}</td>
              <td className="p-2 border font-medium">{r.user_input}</td>
              <td className="p-2 border">{r.summary}</td>
              <td className="p-2 border font-medium">
                {americanFormatter.format(new Date(r.created_at))}
              </td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {results.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No results yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
