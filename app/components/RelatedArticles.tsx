import {Image} from '@shopify/hydrogen';

interface RelatedArticlesProps {
  title?: string;
  articles: any[]; // 使用 any[] 类型
  readMoreText?: string;
}

export function RelatedArticles({
  title = "Related Articles",
  articles,
  readMoreText = "Read more →"
}: RelatedArticlesProps) {
  return (
    <div className="my-16">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.fullPath} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {article.image && (
              <a href={`/${article.fullPath}`} className="block">
                <Image
                  data={article.image}
                  className="w-full h-48 object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </a>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">
                <a 
                  href={`/${article.fullPath}`}
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h3>
              {article.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              <a 
                href={`/${article.fullPath}`}
                className="mt-3 inline-block text-blue-600 font-medium text-sm hover:underline"
              >
                {readMoreText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}