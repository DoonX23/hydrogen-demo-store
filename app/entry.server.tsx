import type {AppLoadContext, EntryContext} from '@shopify/remix-oxygen';
import { ServerRouter } from 'react-router';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      "'self'",
      'localhost:*',
      'https://cdn.shopify.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
      'https://d3g5hqndtiniji.cloudfront.net', // Okendo
      'https://dov7r31oq5dkj.cloudfront.net',  // Okendo
      'https://cdn-static.okendo.io',         // Okendo
      'https://surveys.okendo.io',             // Okendo
      'https://api.okendo.io',                 // Okendo
      'data:',
    ],
      // 添加 styleSrc
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://*.crisp.chat',
    'https://*.googletagmanager.com',
    'https://cdn.shopify.com',
    'https://fonts.googleapis.com', // 添加 Google Fonts 样式
    'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
    'https://cdn-static.okendo.io',         // Okendo
    'https://surveys.okendo.io',             // Okendo
  ],
  // 添加 fontSrc
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com', // 添加 Google Fonts 字体文件
    'https://cdn.shopify.com', // 添加 Shopify CDN
    'https://*.crisp.chat',
    'https://www.googletagmanager.com',
    'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
    'https://dov7r31oq5dkj.cloudfront.net',  // Okendo
    'https://cdn-static.okendo.io',         // Okendo
    'https://surveys.okendo.io',             // Okendo
  ],
    scriptSrc: [
      'self',
      "'strict-dynamic'",
      'https://*.doubleclick.net',
      'https://*.shopify.com',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://*.hsforms.net', // HubSpot表单域名
      'https://*.googleapis.com',  // 添加这行
      'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
      'https://dov7r31oq5dkj.cloudfront.net',  // Okendo
      'https://cdn-static.okendo.io',         // Okendo
      'https://surveys.okendo.io',             // Okendo
      'https://api.okendo.io',                 // Okendo
      "https://challenges.cloudflare.com",
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    connectSrc: [
      "'self'",
      'https://*.clarity.ms',
      'https://*.crisp.chat',
      'wss://*.crisp.chat',
      'https://*.doubleclick.net',
      'https://*.google-analytics.com',
      'https://*.google.com',
      'https://google.com',
      'https://*.googletagmanager.com',
      // HubSpot - 使用通配符合并多个子域名
      'https://*.hubspot.com',     // 覆盖 forms.hubspot.com, api.hubspot.com
      'https://*.hsforms.com',     // 覆盖 forms.hsforms.com
      'https://*.hsforms.net',     // 覆盖 所有 hsforms.net 子域名
      'https://*.hubapi.com',      // 覆盖 api.hubapi.com
      
      // Amazon S3 for HubSpot
      'https://*.amazonaws.com',    // 覆盖所有 HubSpot 的 S3 存储
      "https://usually-fleet-jawfish.ngrok-free.app", // 添加你的ngrok域名
      'https://api.okendo.io',                 // Okendo
      'https://cdn-static.okendo.io',         // Okendo
      'https://surveys.okendo.io',             // Okendo
      'https://api.raygun.com',                // Okendo (Error Reporting)
    ],
    frameSrc: [
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://*.doubleclick.net',
      'https://*.hsforms.com',
      'https://*.hubspot.com',     // 添加
      'https://www.youtube.com',
      'https://www.google.com',
      'https://www.gstatic.com',
      "https://challenges.cloudflare.com",
    ],
    imgSrc: [                        // 添加 imgSrc 配置
      "'self'",
      'data:',
      'https://*.clarity.ms',
      'https://*.crisp.chat',
      'https://*.shopify.com',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://fonts.gstatic.com',
      'https://*.hsforms.com',
      'https://*.hubspot.com',
      // Google 域名 - 使用有限制的通配符
      'https://*.google.com',
      'https://*.google.com.hk',
      'https://*.doubleclick.net',
      'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
      'https://d3g5hqndtiniji.cloudfront.net', // Okendo
      'https://dov7r31oq5dkj.cloudfront.net',  // Okendo
      'https://cdn-static.okendo.io',         // Okendo
      'https://surveys.okendo.io',             // Okendo
    ],
    mediaSrc: [
      "'self'",
      'https://d3hw6dc1ow8pp2.cloudfront.net', // Okendo
      'https://d3g5hqndtiniji.cloudfront.net', // Okendo
      'https://dov7r31oq5dkj.cloudfront.net',  // Okendo
      'https://cdn-static.okendo.io',         // Okendo
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter context={reactRouterContext} url={request.url} nonce={nonce} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
