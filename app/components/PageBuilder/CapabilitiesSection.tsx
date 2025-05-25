// 修改后的 CapabilitiesSection.tsx
import React from 'react';
import { Link } from '~/components/Link'; // 假设Link组件位于这个路径
import { Image } from '@shopify/hydrogen';
import ListItems, { ListItem } from './ListItems';

interface ServiceItem {
  title?: string;
  description?: string;
  image?: {
    url?: string;
    alt?: string;
  };
  list?: ListItem[];
  readMore?: string;
  href?: string;
}

interface CapabilitiesSectionProps {
  heading?: string;
  subheading?: string;
  services?: ServiceItem[];
  // 可以保留 block 属性以保持向后兼容性
  block?: {
    heading?: string;
    subheading?: string;
    services?: ServiceItem[];
  };
}

const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ 
  heading, 
  subheading, 
  services, 
  block 
}) => {
  // 优先使用直接传递的属性，如果没有则使用 block 中的属性
  const finalHeading = heading || block?.heading;
  const finalSubheading = subheading || block?.subheading;
  const finalServices = services || block?.services;

  return (
    <div className="container py-10 lg:py-36">
      <div className="text-center mx-auto mb-5 lg:mb-10">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
          {finalHeading}
        </h2>
        <p className="mt-4 text-lg/8 text-gray-600">
          {finalSubheading}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10 py-10">
        {finalServices && finalServices.map((service, sIndex) => (
          <Link
            key={sIndex}
            className="group block rounded-xl overflow-hidden focus:outline-none"
            to={service.href || "#"}
          >
            {/* 服务项内容不变 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
                {service.image?.url && (
                  <Image
                    className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
                    src={service.image.url}
                    alt={service.image?.alt || service.title || ""}
                  />
                )}
              </div>

              <div className="grow">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600">
                  {service.title}
                </h3>
                <p className="mt-3 text-gray-600">
                  {service.description}
                </p>
                <ListItems list={service.list} />
                <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-brand decoration-2 group-hover:underline group-focus:underline font-medium">
                  {service.readMore || "Read more"}
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CapabilitiesSection;