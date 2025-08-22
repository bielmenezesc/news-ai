"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ArticleForm({ article }: { article: any }) {
  const [input, setInput] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article, userInput: input }),
    });
    router.push("/results");

    const { error } = await supabase.rpc("upsert_selection_count", {
      p_article_id: article.id,
    });

    if (error) {
      console.error("Erro in upsert_selection_count:", error);
      return;
    }
  };

  if (isLoading) {
    return (
      <main className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </main>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <h1 className="text-4xl font-bold text-white mb-6">{article.title}</h1>

      <p className="text-white leading-relaxed mb-8">{article.content}</p>

      <hr className="mb-8" />

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[120px] p-3 bg-gray-50 rounded-md border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow placeholder:text-black text-black"
          placeholder="Add your context, insights, or questions here...."
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input}
          className="inline-flex items-center justify-center px-5 py-2.5 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
