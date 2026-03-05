import {
  data,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import {getSeoMeta} from '@shopify/hydrogen';

import {PageHeader} from '~/components/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

// 导入 PageBuilder 组件
import SplitSection from '~/components/PageBuilder/SplitSection';
import ImageSliderSection from '~/components/PageBuilder/ImageSliderSection';
import HeroSection from '~/components/PageBuilder/HeroSection';
import StatsSection from '~/components/PageBuilder/StatsSection';
import CardGridSection from '~/components/PageBuilder/CardGridSection';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  // 同时发起两个查询：Shopify 查页面基础数据，Sanity 查 pagebuilder 数据
  const [shopifyResult, sanityResult] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.pageHandle,
        language: context.storefront.i18n.language,
      },
    }),
    (context.sanity as any).query(SANITY_PAGE_QUERY, {
      handle: params.pageHandle,
    }),
  ]);

  // Shopify 页面不存在时返回 404
  if (!shopifyResult.page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({
    page: shopifyResult.page,
    url: request.url,
  });

  return {
    page: shopifyResult.page,
    // Sanity 中可能没有对应的 page 文档，因此用空数组兜底
    pagebuilder: sanityResult?.pagebuilder || [],
    seo,
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Page() {
  const {page, pagebuilder} = useLoaderData<typeof loader>();

  return (
    <>
      {/* 
      <PageHeader heading={page.title}>
        <div
          dangerouslySetInnerHTML={{__html: page.body}}
          className="prose dark:prose-invert"
        />
      </PageHeader>*/}

      {/* Sanity 数据：pagebuilder 内容块 */}
      {pagebuilder.length > 0 && (
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
    </>
  );
}

// Shopify GraphQL 查询：获取页面基础数据，保持不变
const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

// Sanity GROQ 查询：通过 handle 匹配对应的 page 文档，只取 pagebuilder 字段
const SANITY_PAGE_QUERY = `*[_type == "page" && slug.current == $handle][0]{
  pagebuilder[]
}`;