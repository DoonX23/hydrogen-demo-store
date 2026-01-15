import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export const loader = ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  return new Response(robotsTxtData({url: url.origin}), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      // Cache for 24 hours
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
};

function robotsTxtData({url}: {url: string}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /account
Disallow: /en-
Disallow: /de-de/
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /orders

User-agent: SemrushBot
Disallow: /
User-agent: Semrushbot-SA
Disallow: /
User-agent: Semrushbot-SI
Disallow: /
User-agent: AhrefsBot
Disallow: /
User-agent: DotBot
Disallow: /
User-agent: MegaIndex.ru
Disallow: /
User-agent: MauiBot
Disallow: /
User-agent: MJ12bot
Disallow: /
User-agent: BLEXBot
Disallow: /

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}
