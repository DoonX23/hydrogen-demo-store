import {
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {getSeoMeta, Image} from '@shopify/hydrogen'; 
import {PageHeader, Section} from '~/components/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {convertToHtml} from '~/utils/portableText';
import {RelatedArticles} from '~/components/RelatedArticles'; // 导入新组件
import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';

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
  
  console.log(JSON.stringify(article.data));
  
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
  
  // 使用 Response.json() 代替弃用的 json 函数
  return Response.json({
    capability: {
      title: article.data.title,
      body: convertToHtml(article.data.body),
      image: article.data.image || null,
      relativeCollections: article.data.relativeCollections || [],
      breadcrumb: article.data.breadcrumb || [], 
      childArticles: article.data.childArticles || []
    },
    seo
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Capability() {
  const {capability} = useLoaderData<typeof loader>() as any;;
  const {title, body, image, relativeCollections, breadcrumb, childArticles} = capability;
  
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
        
        {/* 正文内容 */}
        <div
          dangerouslySetInnerHTML={{__html: body}}
          className="article prose prose-sm sm:prose lg:prose-lg mx-auto mt-8"
        />
        
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
            title="Related Articles"
            readMoreText="Read more →"
          />
        )}
      </Section>
    </div>
  );
}