import {
  data,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData } from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import {useEffect, useRef} from 'react';

declare global {
  interface Window {
    hbspt: any;
  }
}

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  //删除 invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      //handle: params.pageHandle,
      handle: 'contact-doonx',
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({page, url: request.url});

  return data({page, seo});
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Page() {
  const formContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 如果已经加载过表单,直接返回
    if (formContainerRef.current?.querySelector('iframe')) return;

    const script = document.createElement('script');
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = () => {
      window.hbspt.forms.create({
        portalId: "21243260",
        formId: "4a112389-a712-487f-8a20-81b18b697748",
        target: "#hubspot-form",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  return (
    <>
      {/* 新增 */}
      <div className="relative isolate overflow-hidden bg-gray-900">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Contact DoonX
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
          From prototype parts to production runs
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="/pages/about-doonx" className="text-sm/6 font-semibold text-white">
              Learn more about DoonX <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
      >
        <circle r={512} cx={512} cy={512} fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7" />
        <defs>
          <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
          <stop stopColor="#7775D6" />
          <stop offset={1} stopColor="#E935C1" />

          </radialGradient>
        </defs>
      </svg>
    </div>



      <div className="relative isolate bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative px-6 pt-24 pb-20 sm:pt-32 lg:static lg:px-8 lg:py-24">
          <div className="mx-auto lg:mx-0 lg:max-w-lg">
            <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
              <svg
                aria-hidden="true"
                className="absolute inset-0 size-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              >
                <defs>
                  <pattern
                    x="100%"
                    y={-1}
                    id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                    width={200}
                    height={200}
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M130 200V.5M.5 .5H200" fill="none" />
                  </pattern>
                </defs>
                <rect fill="white" width="100%" height="100%" strokeWidth={0} />
                <svg x="100%" y={-1} className="overflow-visible fill-gray-50">
                  <path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
                </svg>
                <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
              </svg>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
              Get in touch
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
            If you have any queries, please do not hesitate to call our friendly and knowledgeable team.
            </p>
            <dl className="mt-10 space-y-4 text-base/7 text-gray-600">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Address</span>
                  <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                Xitou Industrial zone, Longsheng Road, Longhua<br />
                Shenzhen City, Guangdong Province, China
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Address</span>
                  <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                30 N Gould St Ste 100Sheridan, WY 82801, United State<br />
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Telephone</span>
                  <PhoneIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                  <a href="tel:+1 (307) 221 5730" className="hover:text-gray-900">
                  +1 (307) 221 5730
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                  <a href="mailto:support@doonx.com" className="hover:text-gray-900">
                  support@doonx.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {/*放hubspot form*/}
        <div className="relative container px-6 pt-24 pb-20 sm:pt-32 lg:static lg:px-8 lg:py-24" id="hubspot-form" ref={formContainerRef} />
      </div>
    </div>
      {/* 新增结束 */}
    </>
  );
}

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