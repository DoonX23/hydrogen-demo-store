import {
    data,
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
import { CollectionSlider } from '~/components/CollectionsSlider';
// 导入 PageBuilder 组件
import SplitSection from '~/components/PageBuilder/SplitSection';
import ImageSliderSection from '~/components/PageBuilder/ImageSliderSection';
import HeroSection from '~/components/PageBuilder/HeroSection';
import StatsSection from '~/components/PageBuilder/StatsSection';
import CardGridSection from '~/components/PageBuilder/CardGridSection';

export const headers = routeHeaders;

// ==========================================
// 💡 核心配置区：根节点别名
// ==========================================
// 在 materials.$.tsx 中，它是 'materials'。
// 当你新建 shape.$.tsx 时，只需把这里改成 'shape' 即可！
const ROOT_SLUG = 'materials';

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  // 因为有 _index.tsx，进入到这里的 params['*'] 一定有值，比如 "company/about"
  invariant(params['*'], `Missing ${ROOT_SLUG} handle`);
  const rawPath = params['*']; 

  // 1. 将 URL 拆分成层级数组，并强制把根节点塞在第一个
  // 例如 URL 是 materials/company/about -> ['materials', 'company', 'about']
  const segments = [ROOT_SLUG, ...rawPath.split('/').filter(Boolean)];
  
  // 目标文章永远是数组的最后一个（比如 'about'）
  const targetSlug = segments[segments.length - 1];

  // 2. 数据库查询：把这个链条里所有的文章全查出来（一网打尽）
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

  // 4. 层级验证函数（验证是否属于正确的父子关系）
  function verifyHierarchy(candidate: any, allArticles: any[], expectedPath: string[]) {
    let currentDoc = candidate;
    let validatedChain = [];

    // 从后往前倒推验证
    for (let i = expectedPath.length - 1; i >= 0; i--) {
      const expectedSlug = expectedPath[i];

      if (currentDoc.slug !== expectedSlug) {
        return { isValid: false, chain: [] };
      }

      validatedChain.unshift(currentDoc);

      if (i > 0) {
        const parentDoc = allArticles.find((a: any) => a._id === currentDoc.parentId);
        if (!parentDoc) {
          return { isValid: false, chain: [] }; // 断层了
        }
        currentDoc = parentDoc;
      }
    }

    // 检查最顶层（比如 materials）是否还有父级，如果有，说明错误
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

  // 如果校验全失败，说明路径错误，报404
  if (!finalArticle) {
    console.log('404 - Article not found or hierarchy mismatch');
    throw new Response(null, { status: 404 });
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

  // 8. 组装原本需要的 SEO 数据
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

  // 返回数据给前端组件
  return {
    material: {
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

export default function Material() {
  const {material} = useLoaderData<typeof loader>();
  const {title, body, image, relativeCollections, breadcrumb, childArticles, pagebuilder} = material; // 解构出 pagebuilder
  return (
    <>
   <div className='w-full md:container overflow-hidden'>
      {/* 面包屑导航 */}
      {breadcrumb && breadcrumb.length > 0 && (
        <ArticleBreadcrumb breadcrumb={breadcrumb} />
      )}
      
      {/* 页面标题 */}
      <PageHeader heading={title} variant="blogPost">
      </PageHeader>
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
      <Section as="article" padding="x">
        {image && (
          <Image
            data={image}
            className="w-full mx-auto mt-8 md:mt-16 max-w-7xl"
            sizes="90vw"
            loading="eager"
          />
        )}
        <div
          dangerouslySetInnerHTML={{__html: body}}
          className="prose prose-sm mx-auto mt-8 max-w-none"
        />
        {/* 添加集合展示部分 
        {relativeCollections && relativeCollections.length > 0 && (
          <div className="mt-12">
            <FeaturedCollections
              collections={{nodes: relativeCollections}}
              title="Related Collections"
            />
          </div>
        )}*/}

        {/* 在父组件中进行条件渲染 */}
        {childArticles && childArticles.length > 0 && (
          <RelatedArticles 
            articles={childArticles} 
            title="Related Materials"
            readMoreText="Read more →"
          />
        )}
      </Section>
    </div>
    {/* 
    {relativeCollections && relativeCollections.length > 0 && (
      <CollectionSlider
        heading_bold="Discover more."
        heading_light=""
        sub_heading=""
        collections={relativeCollections}
        button_text="See Collection"
        isSkeleton={false}
      />
    )}
    */}
  </>
  );
}
