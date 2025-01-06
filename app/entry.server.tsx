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
    'https://cdn.shopify.com',
    'https://fonts.googleapis.com', // 添加 Google Fonts 样式
  ],
  // 添加 fontSrc
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com', // 添加 Google Fonts 字体文件
  ],
    scriptSrc: [
      'self',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://js.hsforms.net', // 添加HubSpot的域名
      'https://forms.hsforms.net', // HubSpot表单域名
      'https://fonts.googleapis.com',  // 添加这行
      ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
    ],
    connectSrc: [
      // HubSpot - 使用通配符合并多个子域名
      'https://*.hubspot.com',     // 覆盖 forms.hubspot.com, api.hubspot.com
      'https://*.hsforms.com',     // 覆盖 forms.hsforms.com
      'https://*.hsforms.net',     // 覆盖 所有 hsforms.net 子域名
      'https://*.hubapi.com',      // 覆盖 api.hubapi.com
      
      // Amazon S3 for HubSpot
      'https://*.amazonaws.com',    // 覆盖所有 HubSpot 的 S3 存储
    ],
    frameSrc: [
      'https://forms.hsforms.com',
      'https://app.hubspot.com',     // 添加
    ],
    imgSrc: [                        // 添加 imgSrc 配置
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://forms-na1.hsforms.com',
      'https://*.hsforms.com',
      'https://*.hubspot.com',
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
