import React from 'react';
import { Link } from '~/components/Link'; // 假设Link组件位于这个路径
import ListItems, { ListItem } from './ListItems';

interface HeroSectionProps {
  tagline?: string;
  taglineLink?: string;
  taglineLinkText?: string;
  heading?: string;
  description?: string;
  list?: ListItem[];
  // 保留 block 属性以保持向后兼容性
  block?: {
    tagline?: string;
    taglineLink?: string;
    taglineLinkText?: string;
    heading?: string;
    description?: string;
    list?: ListItem[];
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  tagline,
  taglineLink,
  taglineLinkText,
  heading,
  description,
  list,
  block 
}) => {
  // 优先使用直接传递的属性，如果没有则使用 block 中的属性
  const finalTagline = tagline || block?.tagline;
  const finalTaglineLink = taglineLink || block?.taglineLink;
  const finalTaglineLinkText = taglineLinkText || block?.taglineLinkText;
  const finalHeading = heading || block?.heading;
  const finalDescription = description || block?.description;
  const finalList = list || block?.list;

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 py-14 lg:px-8">
        {/* 顶部背景装饰 */}
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
          {finalTagline && (
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                {finalTagline}{" "}
                {finalTaglineLinkText && finalTaglineLink && (
                  <Link to={finalTaglineLink} className="font-semibold text-brand">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {finalTaglineLinkText} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              {finalHeading}
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              {finalDescription}
            </p>

            {/* 渲染列表项目 */}
            <div className="mt-8 flex justify-center">
              <div className="mx-auto max-w-lg">
                <ListItems list={finalList} />
              </div>
            </div>
          </div>
        </div>

        {/* 底部背景装饰 */}
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
  );
};

export default HeroSection;