import {
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta, Image} from '@shopify/hydrogen'; 
import {PageHeader, Section} from '~/components/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {convertToHtml} from '~/utils/portableText';
import {RelatedArticles} from '~/components/RelatedArticles'; // 导入新组件
import ArticleBreadcrumb from '~/components/ArticleBreadcrumb';

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  // 这里不需要从params获取路径，因为我们直接查询capabilities根页面
  const fullPath = 'capabilities'; // 根路径

  // 使用GROQ查询语句查询根capabilities页面
  const query = `*[_type == "article" && fullPath == $fullPath][0]{
    title,
    slug,
    fullPath,
    excerpt,
    image,
    breadcrumb,
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
      title: article.data.seo?.title || article.data.title,
      description: article.data.seo?.description || article.data.excerpt,
    },
    publishedAt: article.data.updatedAt,
    excerpt: article.data.excerpt,
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
    material: {
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

export default function CapabilitiesIndex() {
  const {material} = useLoaderData<typeof loader>() as any;
  const {title, body, image, relativeCollections, breadcrumb, childArticles} = material;
  
  return (
    <div className='container'>
      {/* 面包屑导航 - 索引页面可能只有首页和当前页面 */}
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
            title="Our Capabilities"
            readMoreText="Learn more →"
          />
        )}
      </Section>
    </div>
  );
}