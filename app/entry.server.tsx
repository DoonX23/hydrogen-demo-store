import type {AppLoadContext, EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
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
  ],
  // 添加 fontSrc
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com', // 添加 Google Fonts 字体文件
    'https://cdn.shopify.com', // 添加 Shopify CDN
    'https://*.crisp.chat',
    'https://www.googletagmanager.com',
  ],
    scriptSrc: [
      'self',
      "'strict-dynamic'",
      'https://*.doubleclick.net',
      'https://*.shopify.com',
      'https://*.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://www.googletagmanager.com/debug/badge',
      'https://*.hsforms.net', // HubSpot表单域名
      'https://*.googleapis.com',  // 添加这行
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    connectSrc: [
      "'self'",
      'https://*.crisp.chat',
      'wss://*.crisp.chat',
      'https://*.doubleclick.net',
      'https://*.google-analytics.com',
      'https://*.google.com',
      'https://*.googletagmanager.com',
      // HubSpot - 使用通配符合并多个子域名
      'https://*.hubspot.com',     // 覆盖 forms.hubspot.com, api.hubspot.com
      'https://*.hsforms.com',     // 覆盖 forms.hsforms.com
      'https://*.hsforms.net',     // 覆盖 所有 hsforms.net 子域名
      'https://*.hubapi.com',      // 覆盖 api.hubapi.com
      
      // Amazon S3 for HubSpot
      'https://*.amazonaws.com',    // 覆盖所有 HubSpot 的 S3 存储
    ],
    frameSrc: [
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://*.doubleclick.net',
      'https://*.hsforms.com',
      'https://*.hubspot.com',     // 添加
    ],
    imgSrc: [                        // 添加 imgSrc 配置
      "'self'",
      'data:',
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
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
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
