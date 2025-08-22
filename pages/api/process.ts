import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const response = await fetch(process.env.N8N_WORKFLOW_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    const summary = data?.output?.summary;

    const relevance_score = data?.output?.relevance_score;

    const { article, userInput } = req.body;

    if (relevance_score !== undefined && relevance_score !== null) {
      const { error: rpcError } = await supabase.rpc("update_ai_score", {
        p_article_id: article.id,
        p_new_score: relevance_score,
      });

      if (rpcError) {
        console.error("Error updating AI score:", rpcError);
      }
    }

    const { error } = await supabase.from("summaries").insert([
      {
        article_id: article.id,
        article_title: article.title,
        summary: summary,
        user_input: userInput,
      },
    ]);

    if (error) {
      console.error("Error saving summary:", error);
      return;
    }

    return res.status(200).json({ ok: true, summary });
  } catch (err: any) {
    console.error("Erro no /api/process:", err);
    return res
      .status(500)
      .json({ error: "Erro ao processar", details: err.message });
  }
}
