import { fetchArticles } from "@/lib/api";
import Link from "next/link";

export default async function Home() {
  const articles = await fetchArticles();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Articles</h1>
      <div className="grid gap-4">
        {articles.map((a: any) => (
          <Link key={a.id} href={`/articles/${a.id}`}>
            <div className="border p-4 rounded hover:bg-gray-50 hover:text-black cursor-pointer">
              <h2 className="font-semibold">{a.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
