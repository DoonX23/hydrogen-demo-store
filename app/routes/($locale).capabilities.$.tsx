import {
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import {getSeoMeta, Image} from '@shopify/hydrogen'; 
import {PageHeader, Section} from '~/components/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {convertToHtml} from '~/utils/portableText';
import {RelatedArticles} from '~/components/RelatedArticles'; // 导入新组件
import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';
// 导入新组件
import ListItems from '~/components/PageBuilder/ListItems';
import SplitSection from '~/components/PageBuilder/SplitSection';
import ImageSliderSection from '~/components/PageBuilder/ImageSliderSection';
import HeroSection from '~/components/PageBuilder/HeroSection';
import StatsSection from '~/components/PageBuilder/StatsSection';
import CardGridSection from '~/components/PageBuilder/CardGridSection';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params['*'], 'Missing capabilities handle');
  const path = params['*']; // 获取url中的路径参数

  // 构建完整路径
  const fullPath = `capabilities/${path}`;

  // 使用GROQ查询语句
  const query = `*[_type == "article" && fullPath == $fullPath][0]{
    title,
    slug,
    fullPath,
    excerpt,
    image,
    breadcrumb, // 添加获取面包屑数据
    pagebuilder[], // 确保包含pagebuilder并指定它是一个数组
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
    publishedAt,
    "parentArticle": parentArticle->{
      title,
      slug,
      fullPath
    },
    "childArticles": *[_type == "article" && parentArticle._ref == ^._id]{
      title,
      slug,  
      fullPath,
      excerpt,
      image
    }
  }`;

  const article = await (context.sanity as any).loadQuery(query, {
    fullPath
  });
  

  
  if (!article) {
    console.log('404');
    throw new Response(null, {status: 404});
  }

  const articleData = {
    title: article.data.title,
    contentHtml: convertToHtml(article.data.body),
    seo: {
      title: article.data.seo.title,
      description: article.data.seo.description,
    },
    publishedAt: article.data.updatedAt,
    excerpt: article.data.excerpt,
    // 增加 image 字段
    image: article.data.image ? {
      url: article.data.image.url,
      height: article.data.image.height,
      width: article.data.image.width,
      altText: article.data.image.altText
    } : null
  };
  
  const seo = seoPayload.article({
    article: articleData,
    url: request.url,
  });
  
  // 1. json()和defer()方法在新版本中已废弃，需升级为data()
  // 2. 使用data()会导致类型被多层包装：先被DataWithResponseInit<T>包装，再被useLoaderData的JsonifyObject<>包装，最终类型为JsonifyObject<DataWithResponseInit<T>>，造成严重类型丢失
  return {
    capability: {
      title: article.data.title,
      body: convertToHtml(article.data.body),
      image: article.data.image || null,
      pagebuilder: article.data.pagebuilder || [], // 添加pagebuilder数据
      relativeCollections: article.data.relativeCollections || [],
      breadcrumb: article.data.breadcrumb || [], 
      childArticles: article.data.childArticles || []
    },
    seo
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Capability() {
  const {capability} = useLoaderData<typeof loader>();
  const {title, body, image, relativeCollections, breadcrumb, childArticles, pagebuilder} = capability;

  return (
    <>        {/* Page Builder 内容 */}
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
