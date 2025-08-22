type Props = {
  title: string;
  thumbnail_url: string;
  url: string;
};

export default function ArticleCard({ title, thumbnail_url, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      className="border p-4 rounded-lg hover:shadow"
    >
      <img
        src={thumbnail_url}
        alt={title}
        className="w-full h-40 object-cover rounded"
      />
      <h2 className="mt-2 font-semibold">{title}</h2>
    </a>
  );
}
