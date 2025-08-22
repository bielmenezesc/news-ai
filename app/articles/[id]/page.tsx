import { fetchArticles } from "@/lib/api";
import ArticleForm from "./ArticleForm";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articles = await fetchArticles();

  const article = await articles.find((a: any) => a.id.toString() === id);

  if (!article) return <p>Article not found...</p>;

  return <ArticleForm article={article} />;
}
