import React from 'react';
import { Link } from '~/components/Link'; // 引入Link组件
import { Image } from '@shopify/hydrogen'; // 引入Image组件
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import ListItems, { ListItem } from './ListItems';

interface SplitSectionProps {
  block?: {
    _type?: string;
    imageOnRight?: boolean;
    cta?: string;
    buttonLink?: string;
    heading?: string;
    byline?: string;
    list?: ListItem[];
    buttonText?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    image?: {
      url?: string;
      altText?: string;
      width?: number;
      height?: number;
    };
  };
}

const SplitSection: React.FC<SplitSectionProps> = ({ block }) => {
  return (
    <div className="relative bg-white">
      <div className="mx-auto container py-8 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:px-4">
        {/* 动态决定图片和内容的位置 */}
        {block?.imageOnRight ? (
          // 内容在左，图片在右
          <>
            <div className="px-6 lg:col-span-1 lg:px-0 flex items-center">
              <div className="mx-auto max-w-2xl lg:mx-0">
                {block.cta && (
                  <div className="flex">
                    <div className="relative flex items-center gap-x-4 rounded-full bg-white px-4 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                      <span className="font-semibold text-brand">{block.cta}</span>
                      <span aria-hidden="true" className="h-4 w-px bg-gray-900/10" />
                      <Link to={block.buttonLink || "#"} className="flex items-center gap-x-1">
                        <span aria-hidden="true" className="absolute inset-0" />
                        See more
                        <ChevronRightIcon aria-hidden="true" className="-mr-2 size-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                )}

                {block.heading && (
                  <h1 className="mt-10 text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {block.heading}
                  </h1>
                )}

                {block.byline && (
                  <p className="mt-8 text-pretty text-lg font-medium text-gray-600">
                    {block.byline}
                  </p>
                )}
                
                {/* 渲染列表项目 */}
                <ListItems list={block.list} />

                {/* 按钮组 */}
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to={block.buttonLink || "#"}
                    className="rounded-md bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {block.buttonText || 'Get started'}
                  </Link>
                  {block.secondaryButtonText && (
                    <Link 
                      to={block.secondaryButtonLink || block.buttonLink || "#"} 
                      className="text-sm/6 font-semibold text-gray-900"
                    >
                      {block.secondaryButtonText} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            <div className="relative lg:col-span-1 mt-8 lg:mt-0">
              {block.image?.url && (
                <Image
                  src={block.image.url}
                  alt={block.image.altText || ""}
                  className="w-full h-auto object-cover rounded-lg"
                  width={block.image.width || 600}
                  height={block.image.height || 400}
                  loading="lazy"
                />
              )}
            </div>
          </>
        ) : (
          // 图片在左，内容在右
          <>
            <div className="relative lg:col-span-1">
              {block?.image?.url && (
                <Image
                  src={block.image.url}
                  alt={block.image.altText || ""}
                  className="w-full h-auto object-cover rounded-lg"
                  width={block.image.width || 600}
                  height={block.image.height || 400}
                  loading="lazy"
                />
              )}
            </div>
            
            <div className="px-6 lg:col-span-1 lg:px-0 flex items-center mt-8 lg:mt-0">
              <div className="mx-auto max-w-2xl lg:mx-0">
                {block?.cta && (
                  <div className="flex">
                    <div className="relative flex items-center gap-x-4 rounded-full bg-white px-4 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                      <span className="font-semibold text-brand">{block.cta}</span>
                      <span aria-hidden="true" className="h-4 w-px bg-gray-900/10" />
                      <Link to={block.buttonLink || "#"} className="flex items-center gap-x-1">
                        <span aria-hidden="true" className="absolute inset-0" />
                        See more
                        <ChevronRightIcon aria-hidden="true" className="-mr-2 size-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                )}

                {block?.heading && (
                  <h1 className="mt-10 text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {block.heading}
                  </h1>
                )}

                {block?.byline && (
                  <p className="mt-8 text-pretty text-lg font-medium text-gray-600">
                    {block.byline}
                  </p>
                )}
                
                {/* 渲染列表项目 */}
                <ListItems list={block?.list} />
                
                {/* 按钮组 */}
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to={block?.buttonLink || "#"}
                    className="rounded-md bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {block?.buttonText || 'Get started'}
                  </Link>
                  {block?.secondaryButtonText && (
                    <Link to={block?.secondaryButtonLink || block.buttonLink || "#"} className="text-sm/6 font-semibold text-gray-900">
                      {block.secondaryButtonText} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SplitSection;