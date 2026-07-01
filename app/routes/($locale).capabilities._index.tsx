import {
  data,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData } from 'react-router';
import { getSeoMeta, Image } from '@shopify/hydrogen'; 
import { PageHeader, Section } from '~/components/Text';
import { routeHeaders } from '~/data/cache';
import { seoPayload } from '~/lib/seo.server';
import { FeaturedCollections } from '~/components/FeaturedCollections';
import { convertToHtml } from '~/utils/portableText';
import { RelatedArticles } from '~/components/RelatedArticles';
import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';
import ListItems from '~/components/PageBuilder/ListItems';
import SplitSection from '~/components/PageBuilder/SplitSection';
import ImageSliderSection from '~/components/PageBuilder/ImageSliderSection';
import HeroSection from '~/components/PageBuilder/HeroSection';
import StatsSection from '~/components/PageBuilder/StatsSection';
import CardGridSection from '~/components/PageBuilder/CardGridSection';

export const headers = routeHeaders;

// ==========================================
// 💡 核心配置区：根节点别名
// ==========================================
const ROOT_SLUG = 'capabilities';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // 使用新的 GROQ 查询语句：
  // 1. 不再使用 fullPath 查，而是直接查 slug.current
  // 2. !defined(parentArticle) 确保它是一个最顶级的根页面
  const query = `*[_type == "article" && slug.current == $rootSlug && !defined(parentArticle)][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    image,
    pagebuilder[],
    "relativeCollections": relativeCollections[]->{ 
      "id": store.gid,
      "title": store.title,
      "handle": store.slug.current,
      "image": {
        "url": store.imageUrl,
        "altText": store.title
      }
    },
    body,
    seo,
    "_updatedAt": _updatedAt,
    "childArticles": *[_type == "article" && parentArticle._ref == ^._id]{
      title,
      "slug": slug.current,  
      excerpt,
      image
    }
  }`;

  const article = await (context.sanity as any).query(query, {
    rootSlug: ROOT_SLUG
  });

  if (!article) {
    console.log('404 - Root page not found');
    throw new Response(null, { status: 404 });
  }

  // 1. 动态生成首页自己的面包屑 (只有它自己一级)
  const rootBreadcrumb = [
    {
      _key: ROOT_SLUG,
      title: article.title,
      path: ROOT_SLUG
    }
  ];

  // 2. 动态生成子文章的 fullPath
  const childArticlesWithFullPath = (article.childArticles || []).map((child: any) => ({
    ...child,
    fullPath: `${ROOT_SLUG}/${child.slug}`
  }));

  const articleData = {
    title: article.title,
    contentHtml: convertToHtml(article.body),
    seo: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
    },
    publishedAt: article._updatedAt,
    excerpt: article.excerpt,
    image: article.image ? {
      url: article.image.url,
      height: article.image.height,
      width: article.image.width,
      altText: article.image.altText
    } : null
  };
  
  const seo = seoPayload.article({
    article: articleData,
    url: request.url,
  });
  
  return {
    capabilities: {
      title: article.title,
      body: convertToHtml(article.body),
      image: article.image || null,
      pagebuilder: article.pagebuilder || [],
      relativeCollections: article.relativeCollections || [],
      breadcrumb: rootBreadcrumb, 
      childArticles: childArticlesWithFullPath
    },
    seo
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function CapabilitiesIndex() {
  const { capabilities } = useLoaderData<typeof loader>();
  const { title, body, image, relativeCollections, breadcrumb, childArticles, pagebuilder } = capabilities;

  return (
    <>
      {/* Page Builder 内容 */}
      {pagebuilder && pagebuilder.length > 0 && (
        <main className="isolate">
          {pagebuilder.map((block: any, index: number) => {
            switch (block._type) {
              case 'splitSection':
                return <SplitSection key={index} block={block} />;

              case 'imageSliderSection':
                return (
                  <div key={index} className="py-10 lg:py-24">
                    <ImageSliderSection block={block} />
                  </div>
                );

              case 'heroSection':
                return <HeroSection key={index} block={block} />;

              case 'cardGridSection':
                return <CardGridSection key={index} block={block} />;

              case 'statsSection':
                return <StatsSection key={index} block={block} />;
                
              default:
                return null;
            }
          })}
        </main>
      )}
      <div className='container'>
        {/* 正文内容 */}
        <Section as="article" padding="x">
          {/* 相关产品集合 */}
          {relativeCollections && relativeCollections.length > 0 && (
            <div className="mt-12">
              <FeaturedCollections
                collections={{nodes: relativeCollections}}
                title="Related Collections"
              />
            </div>
          )}
        </Section>
      </div>
    </>
  );
}