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
import {RelatedArticles} from '~/components/RelatedArticles'; 
import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';

// 导入新组件
import ListItems from '~/components/PageBuilder/ListItems';
import SplitSection from '~/components/PageBuilder/SplitSection';
import ImageSliderSection from '~/components/PageBuilder/ImageSliderSection';
import HeroSection from '~/components/PageBuilder/HeroSection';
import StatsSection from '~/components/PageBuilder/StatsSection';
import CardGridSection from '~/components/PageBuilder/CardGridSection';

export const headers = routeHeaders;

// ==========================================
// 💡 核心配置区：设置当前模块的根节点为 capabilities
// ==========================================
const ROOT_SLUG = 'capabilities';

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params['*'], `Missing ${ROOT_SLUG} handle`);
  const rawPath = params['*']; // 获取url中的路径参数

  // 1. 拆分路径并塞入根节点
  const segments = [ROOT_SLUG, ...rawPath.split('/').filter(Boolean)];
  const targetSlug = segments[segments.length - 1];

  // 2. 数据库查询：把相关层级的文章一网打尽，彻底抛弃 fullPath 的强依赖
  const query = `*[_type == "article" && slug.current in $segments]{
    _id, 
    title, 
    "slug": slug.current, 
    "parentId": parentArticle->_id,
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

  const allFetchedArticles = await (context.sanity as any).query(query, { segments });

  // 3. 找到所有匹配目标名字的候选文章
  const candidateArticles = allFetchedArticles.filter((article: any) => article.slug === targetSlug);

  // 4. 层级验证函数
  function verifyHierarchy(candidate: any, allArticles: any[], expectedPath: string[]) {
    let currentDoc = candidate;
    let validatedChain = [];

    for (let i = expectedPath.length - 1; i >= 0; i--) {
      const expectedSlug = expectedPath[i];

      if (currentDoc.slug !== expectedSlug) {
        return { isValid: false, chain: [] };
      }

      validatedChain.unshift(currentDoc);

      if (i > 0) {
        const parentDoc = allArticles.find((a: any) => a._id === currentDoc.parentId);
        if (!parentDoc) {
          return { isValid: false, chain: [] };
        }
        currentDoc = parentDoc;
      }
    }

    if (currentDoc.parentId) {
      return { isValid: false, chain: [] };
    }

    return { isValid: true, chain: validatedChain };
  }

  // 5. 执行校验并获取最终文章
  let finalArticle = null;
  let breadcrumbData: any[] = [];

  for (const candidate of candidateArticles) {
    const result = verifyHierarchy(candidate, allFetchedArticles, segments);
    if (result.isValid) {
      finalArticle = candidate;
      breadcrumbData = result.chain;
      break;
    }
  }

  if (!finalArticle) {
    console.log('404 - Article not found or hierarchy mismatch');
    throw new Response(null, {status: 404});
  }

  // 6. 动态生成面包屑数据
  let accumulatedPath = '';
  const finalBreadcrumb = breadcrumbData.map((node) => {
    accumulatedPath += accumulatedPath ? `/${node.slug}` : node.slug;
    return {
      _key: accumulatedPath,
      title: node.title,
      path: accumulatedPath
    };
  });

  // 7. 动态生成子文章的 fullPath
  const basePath = `${ROOT_SLUG}/${rawPath}`;
  const childArticlesWithFullPath = (finalArticle.childArticles || []).map((child: any) => ({
    ...child,
    fullPath: `${basePath}/${child.slug}`
  }));

  // 8. 组装 SEO 数据
  const articleData = {
    title: finalArticle.title,
    contentHtml: convertToHtml(finalArticle.body),
    seo: {
      title: finalArticle.seo?.title || finalArticle.title,
      description: finalArticle.seo?.description || finalArticle.excerpt,
    },
    publishedAt: finalArticle._updatedAt,
    excerpt: finalArticle.excerpt,
    image: finalArticle.image ? {
      url: finalArticle.image.url,
      height: finalArticle.image.height,
      width: finalArticle.image.width,
      altText: finalArticle.image.altText
    } : null
  };
  
  const seo = seoPayload.article({
    article: articleData,
    url: request.url,
  });
  
  return {
    // 💡 保持原有的对象名称 'capability'
    capability: {
      title: finalArticle.title,
      body: convertToHtml(finalArticle.body),
      image: finalArticle.image || null,
      pagebuilder: finalArticle.pagebuilder || [], 
      relativeCollections: finalArticle.relativeCollections || [],
      breadcrumb: finalBreadcrumb, 
      childArticles: childArticlesWithFullPath
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
