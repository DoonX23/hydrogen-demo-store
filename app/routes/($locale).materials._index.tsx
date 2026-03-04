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
  
  export async function loader({request, context}: LoaderFunctionArgs) {
    // 这里不需要从params获取路径，因为我们直接查询materials根页面
    const fullPath = 'materials'; // 根路径
  
    // 使用GROQ查询语句查询根materials页面
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
  
    const article = await (context.sanity as any).query(query, {
      fullPath
    });
    
    console.log(JSON.stringify(article.data));
    
    if (!article) {
      console.log('404');
      throw new Response(null, {status: 404});
    }
  
    const articleData = {
      title: article.title,
    // 增加一个防御，万一 body 是 null，不传给报错的函数
    contentHtml: article.body ? convertToHtml(article.body) : "",
      seo: {
        title: article.seo?.title || article.title,
        description: article.seo?.description || article.excerpt,
      },
      publishedAt: article.updatedAt,
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
    
    // 使用 Response.json() 代替弃用的 json 函数
    return {
      material: {
        title: article.title,
        body: article.body ? convertToHtml(article.body) : "",
        image: article.image || null,
        relativeCollections: article.relativeCollections || [],
        breadcrumb: article.breadcrumb || [], 
        childArticles: article.childArticles || []
      },
      seo
    };
  }
  
  export const meta = ({matches}: MetaArgs<typeof loader>) => {
    return getSeoMeta(...matches.map((match) => (match.data as any).seo));
  };
  
  export default function MaterialsIndex() {
    const {material} = useLoaderData<typeof loader>();
    const {title, body, image, relativeCollections, breadcrumb, childArticles} = material;
    
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