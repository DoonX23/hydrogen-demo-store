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
// 导入部分添加
import HeroSection from "~/components/PageBuilder/HeroSection";
import CapabilitiesSection from "~/components/PageBuilder/CapabilitiesSection";
import FeaturesSection from "~/components/PageBuilder/FeaturesSection";
import StatsSection from "~/components/PageBuilder/StatsSection";
import AdvantagesSection from "~/components/PageBuilder/AdvantagesSection";

// 创建hero数据对象
const heroBlock = {
  tagline: "Innovative Plastic Solutions, Crafted for You",
  taglineLink: "/capabilities",
  taglineLinkText: "Explore Our Capabilities",
  heading: "Custom Plastic Film & Parts: Quality & Efficiency Guaranteed",
  description: "We specialize in creating custom plastic films and parts, combining superior materials with precise manufacturing for optimal performance and cost savings.",
};
// 创建一个包含所有Capabilities相关数据的对象
const capabilities = {
  heading: "Our Manufacturing Capabilities",
  subheading: "Delivering Custom Solutions Through Advanced Precision Technology",
  services: [
    {
      title: "Custom Plastic Film",
      description: "Specialized film manufacturing with customized thickness, transparency and surface treatments.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Grey-Ethylene-Vinyl-Acetate-EVA-Film-Sheet-1.webp",
        alt: "Custom Plastic Film",
      },
      readMore: "Explore Films",
      href: "/capabilities/custom-films",
    },
    {
      title: "CNC Machining",
      description: "Precision plastic parts manufacturing through milling, turning and professional post-processing.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "CNC Machining",
      },
      readMore: "View CNC Services",
      href: "/capabilities/cnc-machining",
    },
  ]
};

const featuresBlock = {
  tagline: "Excellence in Plastic Solutions.",
  taglineLink: "/pages/contact-doonx",
  taglineLinkText: "Reach Out",
  heading: "Why Choose DoonX",
  description: "We combine advanced technology with industry expertise to deliver superior custom plastic films and precision CNC parts. Our focus on quality, efficiency, and personalized service ensures solutions that perfectly match your specifications.",
  features: [
    {
      name: "Advanced Manufacturing",
      description: "State-of-the-art equipment for both film production and CNC machining.",
      icon: "ChipIcon" // 更合适的图标
    },
    {
      name: "Material Expertise",
      description: "Specialized knowledge in various plastic materials and their applications.",
      icon: "BeakerIcon" // 代表材料科学的图标
    },
    {
      name: "Quality Assurance",
      description: "Rigorous testing and inspection at every production stage.",
      icon: "ShieldCheckIcon" // 代表保护和质量的图标
    },
    {
      name: "Competitive Pricing",
      description: "Cost-effective solutions without compromising on quality.",
      icon: "CurrencyDollarIcon" // 价格相关图标
    },
    {
      name: "Responsive Service",
      description: "Quick communication and support throughout your project.",
      icon: "ChatBubbleLeftRightIcon" // 沟通相关图标
    },
    {
      name: "Global Delivery",
      description: "Reliable shipping to customers worldwide with tracking capabilities.",
      icon: "GlobeAltIcon" // 全球配送相关图标
    }
  ]
};
// 创建stats数据对象
const statsBlock = {
  heading: "Our Experience in Numbers",
  subheading: "Delivering innovative solutions and trusted partnerships worldwide.",
  stats: [
    { name: "Custom Projects Completed", value: "9,400+" },
    { name: "Years of Manufacturing Expertise", value: "10+" },
    { name: "Long-Term Client Retention Rate", value: "38%" },
    { name: "Countries Served Globally", value: "50+" }
  ]
};
// 创建advantages数据对象
const advantagesBlock = {
  heading: "What Makes Us Extraordinary",
  subheading: "DoonX delivers exceptional plastic film and CNC parts manufacturing with consistent growth. These are the features that make us stand out.",
  advantages: [
    {
      title: "Price and efficiency",
      description: "With our own production facility in Shenzhen, China, we eliminate middlemen to offer up to 30% cost savings and more reliable lead times for both plastic film and CNC machined parts.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Price and efficiency"
      },
      href: "#"
    },
    {
      title: "Engineering support",
      description: "Our engineering team specializes in plastic materials and manufacturing processes, providing expert guidance from material selection to production optimization. We help you select the right approach for your plastic film or CNC part requirements.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Engineering support"
      },
      href: "#"
    },
    {
      title: "Quality assurance",
      description: "Quality comes first at DoonX. As an ISO 9001:2015 certified manufacturer, we provide comprehensive quality documentation including SGS, RoHS, material certifications, and full-dimensional reports. Our quality control process ensures consistent results for all plastic products.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Quality assurance"
      },
      href: "#"
    }
  ]
};

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

  return { page, seo };
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
          {/* 使用 HeroSection 组件，通过block属性传递数据 */}
          <HeroSection block={heroBlock} />
          {/* 使用 CapabilitiesSection 组件，将整个capabilities对象通过block属性传入 */}
          <CapabilitiesSection block={capabilities} />
          {/* 使用 StatsSection 组件 */}
          <StatsSection block={statsBlock} />
          {/* 使用 AdvantagesSection 组件 */}
          <AdvantagesSection block={advantagesBlock} />
          {/* 使用 FeaturesSection 组件替代原来的 Why choose DoonX Feature section */}
          <FeaturesSection block={featuresBlock} />
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
