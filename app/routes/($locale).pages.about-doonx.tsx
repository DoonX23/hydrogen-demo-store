import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getSeoMeta } from "@shopify/hydrogen";

import { PageHeader } from "~/components/Text";
import { routeHeaders } from "~/data/cache";
import { seoPayload } from "~/lib/seo.server";

import {
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";

const services = [
  {
    id: 1,
    href: "/capabilities/cnc-machining",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "CNC Machining",
    description: "Milling, turning and post-processing",
    readMore: "Read more",
  },
  {
    id: 2,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "3D printing",
    description: "FDM, SLA, SLS, MJF",
    readMore: "Read more",
  },
  {
    id: 3,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "Sheet metal fabrication",
    description: "Laser cutting, bending, post-processing",
    readMore: "Read more",
  },
  {
    id: 4,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "Injection molding",
    description: "Prototypes and production tooling",
    readMore: "Read more123",
  },
];

const features = [
  {
    name: "Cutting-Edge Technology",
    description: "State-of-the-art techniques in manufacturing and processing.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Customization Expertise",
    description:
      "Experienced professionals dedicated to excellence and innovation.",
    icon: LockClosedIcon,
  },
  {
    name: "Quality Assurance",
    description:
      "Rigorous testing and quality control processes to guarantee that every product meets the highest standards.",
    icon: ArrowPathIcon,
  },
  {
    name: "Competitive Pricing",
    description: "Offering the best value for high-quality products.",
    icon: FingerPrintIcon,
  },
  {
    name: "Responsive Customer Service",
    description: "Responsive support tailored to your needs.",
    icon: FingerPrintIcon,
  },
  {
    name: "Global Delivery",
    description:
      "Efficient logistics solutions ensuring timely worldwide distribution.",
    icon: FingerPrintIcon,
  },
];

const stats = [
  { id: 1, name: "products developed", value: "9400+" },
  { id: 2, name: "Years in business", value: "10+" },
  { id: 3, name: "Customers with a 10+ Year Relationship", value: "38%" },
  { id: 4, name: "Countries shipped", value: "50+" },
];

const advantages = [
  {
    id: 1,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "Price and efficiency",
    description:
      "Unlike other online rapid prototyping companies that outsource your projects, DoonX has its own rapid prototyping factory in Shenzhen, China. This enables up to 30% additional price reduction and more reliable lead-time.",
  },
  {
    id: 2,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "Engineering support",
    description:
      "More than making custom parts, we provide value. From material selection to prototyping and production, we offer expert engineering support for individual parts and assemblies, providing design advice and cost-effective solutions based on our experience.",
  },
  {
    id: 3,
    href: "#",
    imgSrc:
      "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
    title: "Quality assurance",
    description:
      "Quality comes first at DoonX. As an ISO 9001:2015 certificated prototype manufacturing company, we provide SGS, RoHS, material certifications, and full-dimensional reports for our customers. First Article Inspection Program is also available at your request.",
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export const headers = routeHeaders;

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { page } = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: "about-doonx",
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, { status: 404 });
  }

  const seo = seoPayload.page({ page, url: request.url });

  return json({ page, seo });
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="bg-white">
        <main className="isolate">
          {/* Hero section */}
          <div className="bg-white">
            <div className="relative isolate px-6 pt-14 lg:px-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
              </div>
              <div className="mx-auto max-w-2xl py-32">
                <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                  <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  For exclusive offers.{" "}
                    <a href="/pages/contact" className="font-semibold text-brand">
                      <span aria-hidden="true" className="absolute inset-0" />
                      Reach Out <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-balance text-2xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                    The easiest way to source custom parts
                  </h1>
                  <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                    We ensure top-quality prototypes at competitive prices,
                    maintaining high standards for both complex designs and
                    final products.
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                />
              </div>
            </div>
          </div>

          {/* Our manufacturing capabilities*/}
          <div className="container py-10 lg:py-14 ">
            <div className="text-center mx-auto mb-5 lg:mb-10">
              <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                Our manufacturing capabilities
              </h2>
              <p className="mt-4 text-lg/8 text-gray-600">
                Delivering Custom Solutions Through Advanced Precision
                Technology
              </p>
            </div>

            <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10 py-10">
              {services.map((service) => (
                <a
                  key={service.id}
                  className="group block rounded-xl overflow-hidden focus:outline-none"
                  href={service.href}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
                      <img
                        className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
                        src={service.imgSrc}
                        alt="Blog Image"
                      />
                    </div>

                    <div className="grow">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-gray-600 dark:text-neutral-400">
                        {service.description}
                      </p>
                      <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-brand decoration-2 group-hover:underline group-focus:underline font-medium dark:text-blue-500">
                        {service.readMore}
                        <svg
                          className="shrink-0 size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Our experience in numbers stats section */}
          <div className="bg-white py-10 sm:py-14">
            <div className="container">
              <div className="mx-auto max-w-2xl lg:max-w-none">
                <div className="text-center mx-auto mb-5 lg:mb-10">
                  <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                    Our experience in numbers
                  </h2>
                  <p className="mt-4 text-lg/8 text-gray-600">
                  Delivering innovative solutions and trusted partnerships worldwide.
                  </p>
                </div>
                <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex flex-col bg-gray-400/5 p-8"
                    >
                      <dt className="text-sm/6 font-semibold text-gray-600">
                        {stat.name}
                      </dt>
                      <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* What Makes Us Extraordinary section */}
          <div className="container py-10 lg:py-14">
            <div className="max-w-2xl text-center mx-auto mb-5 lg:mb-10">
              <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
                What Makes Us Extraordinary
              </h2>
              <p className="mt-1 text-gray-600 dark:text-neutral-400">
                DoonX shares a continuous growth of 300%+ year-over-year annual
                growth in rapid prototyping and manufacturing services. These
                are the features that make us stand out.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 lg:mb-14">
              {advantages.map((advantage) => (
                <a
                  key={advantage.id}
                  className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md focus:outline-none focus:shadow-md transition dark:bg-neutral-900 dark:border-neutral-800"
                  href={advantage.href}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      className="w-full object-cover rounded-t-xl"
                      src={advantage.imgSrc}
                      alt="Blog Image"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="mt-2 text-2xl font-bold text-gray-800 group-hover:text-highlight dark:text-neutral-300 dark:group-hover:text-white">
                      {advantage.title}
                    </h3>
                    <p className="mt-2 text-md text-gray-800 dark:text-neutral-400">
                      {advantage.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Why choose DoonX Feature section */}
          <div className="container py-10 lg:py-14">
            <div className="mx-auto max-w-2xl lg:text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                For exclusive offers.{" "}
                  <a href="/pages/contact" className="font-semibold text-brand">
                    <span aria-hidden="true" className="absolute inset-0" />
                    Reach Out <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
                Why choose DoonX
              </p>
              <p className="mt-6 text-lg/8 text-pretty text-gray-600">
                Our dedication to quality, innovation, and customer satisfaction
                sets us apart in the industry. With a comprehensive range of
                products and state-of-the-art manufacturing capabilities, we
                ensure that our solutions are not just effective but perfectly
                tailored to meet the specific needs of our clients.
              </p>
            </div>
            <div className="mx-auto mt-16 container sm:mt-20 lg:mt-24">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base/7 font-semibold text-gray-900">
                      <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-brand">
                        <feature.icon
                          aria-hidden="true"
                          className="size-6 text-white"
                        />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base/7 text-gray-600">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </main>
      </div>
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
