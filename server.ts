// @ts-ignore
// Virtual entry point for the app
import * as remixBuild from 'virtual:react-router/server-build';
import {
  createRequestHandler,
  getStorefrontHeaders,
} from '@shopify/hydrogen/oxygen';
import {
  cartGetIdDefault,
  cartSetIdDefault,
  createCartHandler,
  createStorefrontClient,
  storefrontRedirect,
  createCustomerAccountClient,
} from '@shopify/hydrogen';

import {AppSession} from '~/lib/session.server';
import {getLocaleFromRequest} from '~/lib/utils';
// 添加 Sanity 相关导入，升级sanity再度修改了；
import { createSanityContext, type SanityContext } from 'hydrogen-sanity';
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    sanity: SanityContext;
  }
}
/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set');
      }

      const waitUntil = executionContext.waitUntil.bind(executionContext);
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        AppSession.init(request, [env.SESSION_SECRET]),
      ]);

      // 添加 Sanity 配置 旧版的 createSanityContext 是同步的，而新版必须使用 await 进行异步初始化。
      
      const sanity = await createSanityContext({
        request,
        cache,
        waitUntil,
        client: {
          projectId: env.SANITY_PROJECT_ID,
          dataset: env.SANITY_DATASET || 'production',
          apiVersion: env.SANITY_API_VERSION || 'v2024-08-08',
          useCdn: process.env.NODE_ENV === 'production',
        }
      });

      /**
       * Create Hydrogen's Storefront client.
       */
      const {storefront} = createStorefrontClient({
        cache,
        waitUntil,
        //i18n: getLocaleFromRequest(request),
        i18n: {
                label: "United States (USD $)",  // 字符串需要加引号
                language: "EN",                // 语言代码需要加引号
                country: "US",                 // 国家代码需要加引号
                currency: "USD",               // 货币代码需要加引号
                pathPrefix: ""          // 路径前缀需要加引号
              },
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request),
      });

      /**
       * Create a client for Customer Account API.
       */
      const customerAccount = createCustomerAccountClient({
        waitUntil,
        request,
        session,
        customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
        shopId: env.SHOP_ID,
      });

      const cart = createCartHandler({
        storefront,
        customerAccount,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      });

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          waitUntil,
          storefront,
          customerAccount,
          cart,
          env,
          // 将 sanity 添加到 context 中
          sanity,
        }),
      });

      /**
       * 修复：经 ngrok 等隧道/代理访问本地 dev 服务器时，中间层会改写 Host 头，
       * 导致 Origin ≠ Host，React Router 的 CSRF 防护会在进入 action 之前
       * 直接中止请求（"host header does not match origin header"）。
       * 仅开发模式下生效：以 Origin 为准重建请求恢复两者一致；
       * 生产直连时 Origin 与 Host 本来就一致，此分支不会触发，线上防护不受影响。
       */
      if (process.env.NODE_ENV !== 'production' && request.method !== 'GET') {
        const originHeader = request.headers.get('origin');
        const originHost = originHeader ? new URL(originHeader).host : null;
        const requestHost = request.headers.get('host');
        if (originHost && requestHost && originHost !== requestHost) {
          const url = new URL(request.url);
          url.host = originHost;
          const headers = new Headers(request.headers);
          // 注意：workerd 的 Request 构造器不会自动重建 Host 头，删掉它会导致
          // "host headers are not provided"；但允许显式携带 x-forwarded-host。
          // React Router 的 CSRF 检查优先读取 x-forwarded-host（xfh ?? host），
          // 把它设成与 origin 一致的域名即可通过比对。
          headers.set('x-forwarded-host', originHost);
          request = new Request(url.toString(), {
            method: request.method,
            headers,
            body: request.body,
            // @ts-expect-error Worker/Node 流式请求体要求显式 duplex
            duplex: 'half',
          });
        }
      }

      const response = await handleRequest(request);

      if (session.isPending) {
        response.headers.set('Set-Cookie', await session.commit());
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({request, response, storefront});
      }

      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
