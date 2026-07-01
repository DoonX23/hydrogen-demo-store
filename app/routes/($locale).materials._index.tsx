import {
    data,
    type MetaArgs,
    type LoaderFunctionArgs,
  } from '@shopify/remix-oxygen';
  import { useLoaderData } from 'react-router';
  import {getSeoMeta, Image} from '@shopify/hydrogen'; 
  import {PageHeader, Section} from '~/components/Text';
  import {routeHeaders} from '~/data/cache';
  import {seoPayload} from '~/lib/seo.server';
  import {FeaturedCollections} from '~/components/FeaturedCollections';
  import {convertToHtml} from '~/utils/portableText';
  import {RelatedArticles} from '~/components/RelatedArticles'; // 导入新组件

  import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';

export const headers = routeHeaders;

// ==========================================
// 💡 核心配置区：根节点别名
// ==========================================
// 在 materials._index.tsx 中，它是 'materials'。
// 当你新建 shape._index.tsx 时，只需把这里改成 'shape' 即可！
const ROOT_SLUG = 'materials';

export async function loader({ request, context }: LoaderFunctionArgs) {
  
  // 使用纯净的 GROQ 查询根页面，不再依赖数据库里的 fullPath
  // 直接查找 slug 为 ROOT_SLUG，且没有父级的文章（作为频道的总入口）
  const query = `*[_type == "article" && slug.current == $rootSlug && !defined(parentArticle)][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    image,
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
    console.log(`404 - ${ROOT_SLUG} root page not found`);
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

  // 2. 动态生成子文章的 fullPath (给 RelatedArticles 组件用的跳转链接)
  const childArticlesWithFullPath = (article.childArticles || []).map((child: any) => ({
    ...child,
    fullPath: `${ROOT_SLUG}/${child.slug}`
  }));

  const articleData = {
    title: article.title,
    // 增加一个防御，万一 body 是 null，不传给报错的函数
    contentHtml: article.body ? convertToHtml(article.body) : "",
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
    material: {
      title: article.title,
      body: article.body ? convertToHtml(article.body) : "",
      image: article.image || null,
      relativeCollections: article.relativeCollections || [],
      breadcrumb: rootBreadcrumb, // 使用动态生成的面包屑
      childArticles: childArticlesWithFullPath // 使用拼接了前缀的子文章
    },
    seo
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function MaterialsIndex() {
  const { material } = useLoaderData<typeof loader>();
  const { title, body, image, relativeCollections, breadcrumb, childArticles } = material;

  return (
    <div className='container'>
      {/* 面包屑导航 */}
      {breadcrumb && breadcrumb.length > 0 && (
        <ArticleBreadcrumb breadcrumb={breadcrumb} />
      )}
        
        {/* 页面标题 */}
        <PageHeader heading={title} variant="blogPost">
        </PageHeader>
        
        {/* 正文内容 */}
        <Section as="article" padding="x">
          {/* 特色图片 */}
          {image && (
            <Image
              data={image}
              className="w-full mx-auto mt-8 md:mt-16 max-w-7xl"
              sizes="90vw"
              loading="eager"
            />
          )}

          {/* 相关产品集合 */}
          {relativeCollections && relativeCollections.length > 0 && (
            <div className="mt-12">
              <FeaturedCollections
                collections={{nodes: relativeCollections}}
                title="Related Collections"
              />
            </div>
          )}
          
        {/* 在父组件中进行条件渲染 */}
        {childArticles && childArticles.length > 0 && (
          <RelatedArticles 
            articles={childArticles} 
            title="Our Materials"
            readMoreText="Learn more →"
          />
        )}
        </Section>
      </div>
    );
  }