import { supabase } from "@/lib/supabase";

type Article = {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  url: string;
  datetime: string;
};

type ArticleScores = {
  article_id: string;
  selection_count: number;
  ai_powered_score: number;
  created_at: string;
};

export async function fetchArticles() {
  try {
    // 1. Fetch articles from the external API
    const articlesRes = await fetch(process.env.NEXT_PUBLIC_ARTICLES_API_URL!, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_ARTICLES_API_KEY! },
    });

    if (!articlesRes.ok) {
      throw new Error("Failed to fetch articles from external API");
    }

    const articles = await articlesRes.json();

    // 2. Fetch all scores from the database
    const { data: scores, error: scoresError } = await supabase
      .from("articles_relevance")
      .select("article_id, selection_count, ai_powered_score");

    if (scoresError) {
      throw new Error(scoresError.message);
    }

    // 3. Combining the data for easy lookup
    const scoresMap = new Map(scores.map((score) => [score.article_id, score]));

    const mergedArticles = articles.map((article: Article) => {
      const articleScores = scoresMap.get(article.id);

      return {
        ...article,
        selection_count: articleScores?.selection_count ?? 0,
        ai_powered_score: articleScores?.ai_powered_score ?? 0,
      };
    });

    // 4. Sort the combined list
    const sortedArticles = mergedArticles.sort(
      (a: ArticleScores, b: ArticleScores) => {
        // Criterion 1: Higher selection_count first
        if (a.selection_count !== b.selection_count) {
          return b.selection_count - a.selection_count;
        }
        // Criterion 2: If selection_count is equal, higher ai_powered_score first
        if (a.ai_powered_score !== b.ai_powered_score) {
          return b.ai_powered_score - a.ai_powered_score;
        }
        // Criterion 3: If everything is equal, newest article first
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    );

    return sortedArticles;
  } catch (error) {
    console.error("Error in fetchArticles:", error);
    throw error;
  }
}
