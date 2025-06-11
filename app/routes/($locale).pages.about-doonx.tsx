import {
  type MetaArgs,
  type LoaderFunctionArgs,
} from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { getSeoMeta } from "@shopify/hydrogen";

import { PageHeader } from "~/components/Text";
import { routeHeaders } from "~/data/cache";
import { seoPayload } from "~/lib/seo.server";

// 仅导入需要的组件
import HeroSection from "~/components/PageBuilder/HeroSection";
import StatsSection from "~/components/PageBuilder/StatsSection";
import CardGridSection from "~/components/PageBuilder/CardGridSection";

// 创建hero数据对象
const heroBlock = {
  tagline: "Innovative Plastic Solutions, Crafted for You",
  taglineLink: "/capabilities",
  taglineLinkText: "Explore Our Capabilities",
  heading: "Custom Plastic Film & Parts: Quality & Efficiency Guaranteed",
  description: "We specialize in creating custom plastic films and parts, combining superior materials with precise manufacturing for optimal performance and cost savings.",
};

// 转换为CardGridSection格式的capabilities数据，确保使用正确的字面量类型
const capabilitiesCardGrid = {
  heading: "Our Manufacturing Capabilities",
  subheading: "Delivering Custom Solutions Through Advanced Precision Technology",
  cardLayout: "imageTop" as "imageTop", // 使用类型断言确保类型匹配
  background: "white" as "white", 
  spacing: "normal" as "normal",
  cards: [
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

// 转换为CardGridSection格式的advantages数据，确保使用正确的字面量类型
const advantagesCardGrid = {
  heading: "What Makes Us Extraordinary",
  subheading: "DoonX delivers exceptional plastic film and CNC parts manufacturing with consistent growth. These are the features that make us stand out.",
  cardLayout: "imageTop" as "imageTop", // 使用类型断言确保类型匹配
  background: "lightGray" as "lightGray", 
  spacing: "loose" as "loose", 
  cards: [
    {
      title: "Price and efficiency",
      description: "With our own production facility in Shenzhen, China, we eliminate middlemen to offer up to 30% cost savings and more reliable lead times for both plastic film and CNC machined parts.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Price and efficiency"
      },
      href: "#",
      readMore: "Learn how we save you money",
    },
    {
      title: "Engineering support",
      description: "Our engineering team specializes in plastic materials and manufacturing processes, providing expert guidance from material selection to production optimization. We help you select the right approach for your plastic film or CNC part requirements.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Engineering support"
      },
      href: "#",
      readMore: "Discover our expertise",
    },
    {
      title: "Quality assurance",
      description: "Quality comes first at DoonX. As an ISO 9001:2015 certified manufacturer, we provide comprehensive quality documentation including SGS, RoHS, material certifications, and full-dimensional reports. Our quality control process ensures consistent results for all plastic products.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0736/0459/6001/files/DoonX-Banner.jpg",
        alt: "Quality assurance"
      },
      href: "#",
      readMore: "View our certifications",
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
          {/* 使用 HeroSection 组件 */}
          <HeroSection block={heroBlock} />
          
          {/* 使用 CardGridSection 代替 CapabilitiesSection */}
          <CardGridSection block={capabilitiesCardGrid} />
          
          {/* 使用 StatsSection 组件 */}
          <StatsSection block={statsBlock} />
          
          {/* 使用 CardGridSection 代替 AdvantagesSection */}
          <CardGridSection block={advantagesCardGrid} />
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