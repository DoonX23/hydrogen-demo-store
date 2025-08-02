import {
 
  type LinksFunction,
  type LoaderFunctionArgs,
  type AppLoadContext,
  type MetaArgs,
} from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useRouteError,
  type ShouldRevalidateFunction,
} from 'react-router';
import {
  useNonce,
  Analytics,
  getShopAnalytics,
  getSeoMeta,
  Script,
  type SeoConfig,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {PageLayout} from '~/components/PageLayout';
import {GenericError} from '~/components/GenericError';
import {NotFound} from '~/components/NotFound';
import favicon from '~/assets/favicon.svg';
import {seoPayload} from '~/lib/seo.server';
import styles from '~/styles/app.css?url';

import {DEFAULT_LOCALE, parseMenu} from './lib/utils';
import {GoogleTagManager} from '~/components/GoogleTagManager';

import {OkendoProvider,getOkendoProviderData} from '@okendo/shopify-hydrogen';
export type RootLoader = typeof loader;

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

/**
 * The link to the main stylesheet is purposely not in this list. Instead, it is added
 * in the Layout function.
 *
 * This is to avoid a development bug where after an edit/save, navigating to another
 * link will cause page rendering error "failed to execute 'insertBefore' on 'Node'".
 *
 * This is a workaround until this is fixed in the foundational library.
 */
export const links: LinksFunction = () => {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
  ];
};

// 1. 添加拦截函数
function interceptLocaleRedirect(request: Request) {
  const url = new URL(request.url);
  const firstPathPart = '/' + url.pathname.substring(1).split('/')[0].toLowerCase();
  
  if (firstPathPart.match(/^\/[a-z]{2}-[a-z]{2}/i)) {
    const newPath = url.pathname.replace(/^\/[a-z]{2}-[a-z]{2}/, '');
    throw new Response(null, {
      status: 301,
      headers: {
        'Location': `${url.origin}${newPath}${url.search}`
      }
    });
  }
}

export async function loader(args: LoaderFunctionArgs) {
    // 在加载数据之前进行拦截
    interceptLocaleRedirect(args.request);
    
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({request, context}: LoaderFunctionArgs) {
  const [layout] = await Promise.all([
    getLayoutData(context),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  const {storefront, env} = context;

  return {
    layout,
    seo,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
    },
    selectedLocale: storefront.i18n,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {cart, customerAccount, env} = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
    // 新增的部分
    okendoProviderData: getOkendoProviderData({
      context,
      subscriberId: env.PUBLIC_OKENDO_SUBSCRIBER_ID,
  }),
  };
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<typeof loader>('root');
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="msvalidate.01" content="A352E6A0AF9A652267361BBB572B8468" />
        {/* --- 新增代码开始 --- */}
        {/*
        * 语句解释：
        * 1. <meta ... />: 这是一个HTML元数据标签，用于向浏览器或搜索引擎提供关于页面的信息。
        * 2. name="oke:subscriber_id": 这个 `name` 属性是 Okendo 的脚本专门识别的。它告诉脚本当前商家的订阅者ID是什么。
        * 3. content="413a7610-9d4f-4b8e-b54b-5a1e274c6228": 这个 `content` 属性的值就是您的 Okendo 订阅者ID。
        *    我已经从您代码的`loader`函数中提取了这个值。这个标签能让 Okendo 的功能更快地初始化。
        */}
        <meta name="oke:subscriber_id" content="413a7610-9d4f-4b8e-b54b-5a1e274c6228" />
        {/* --- 新增代码结束 --- */}
        <link rel="stylesheet" href={styles}></link>
        <Meta />
        <Links />
        {/*Script组件限制：
        1. 外联脚本才能使用waitForHydration属性，内联脚本则不能；
        2. 先初始化datalayer，再加载gtm.js；
        3. csp里面还用了"'strict-dynamic'"，所以gtm.js后续动态加载的脚本不需要手动添加 nonce。
        4. 之所以要分开datalayer和gtm.js, 是因为内联脚本包含了gtm.js会动态加载tag脚本，水合的时候会改变dom，导致水合错误。
            分开后，在水合的时候加载内联脚本；而gtm.js使用了waitForHydration属性，会等到水合结束再加载动态tag脚本。
         */}
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
              });
            `
          }}
        />
        <Script
          waitForHydration
          src={`https://www.googletagmanager.com/gtm.js?id=GTM-NT3BGD4`}
        />
      </head>
      <body>
        <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-NT3BGD4"
              height="0"
              width="0"
              style={{
                display: 'none',
                visibility: 'hidden'
              }}
            ></iframe>
          </noscript>

        {data ? (
           /* --- 修改代码开始 --- */
          /*
          * 语句解释：
          * 1. <OkendoProvider ...>: 我们在这里使用从 `@okendo/shopify-hydrogen` 包导入的 OkendoProvider 组件。
          *    Provider 是一种特殊的React组件，它利用React的Context API，将数据或功能“提供”给它内部的所有子组件。
          *    把它放在这里，意味着您网站的所有页面都能访问到Okendo提供的配置和数据。
          *
          * 2. okendoProviderData={data.okendoProviderData}: 这是一个prop（属性）。
          *    - `data`: 这是通过 `useRouteLoaderData` hook 从 `loader` 函数获取的数据对象。
          *    - `data.okendoProviderData`: 我们将 `loader` 中通过 `getOkendoProviderData` 函数获取到的数据，传递给 OkendoProvider。
          *      您已经在 `loadDeferredData` 函数中正确添加了这一部分。
          *
          * 3. nonce={nonce}: 这是另一个prop，用于内容安全策略（CSP）。
          *    - `nonce`: 这个值是通过 `useNonce()` hook 生成的唯一随机字符串。
          *    - 将 `nonce` 传递给 OkendoProvider，可以确保如果 OkendoProvider 需要在页面上动态插入脚本或样式，这些资源能够符合CSP规则，从而被浏览器安全地执行。
          */
          <OkendoProvider
          okendoProviderData={data.okendoProviderData}
          nonce={nonce}
          >
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout
              key={`${locale.language}-${locale.country}`}
              layout={data.layout}
            >
              {children}
            </PageLayout>
            <GoogleTagManager />
          </Analytics.Provider>
          </OkendoProvider>
          /* --- 修改代码结束 --- */
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <Layout>
      {isRouteError ? (
        <>
          {routeError.status === 404 ? (
            <NotFound type={pageType} />
          ) : (
            <GenericError
              error={{message: `${routeError.status} ${routeError.data}`}}
            />
          )}
        </>
      ) : (
        <GenericError error={error instanceof Error ? error : undefined} />
      )}
    </Layout>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      ...Menu
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment GrandChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
    items {
      ...GrandChildMenuItem  
    }
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

async function getLayoutData({storefront, env}: AppLoadContext) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: 'main-menu',
      footerMenuHandle: 'footer',
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const headerMenu = data?.headerMenu
    ? parseMenu(
        data.headerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(
        data.footerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  return {shop: data.shop, headerMenu, footerMenu};
}
