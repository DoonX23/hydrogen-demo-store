import React from 'react';
import { Link } from '~/components/Link'; // 假设Link组件位于这个路径
import { Image } from '@shopify/hydrogen';
import ListItems, { ListItem } from './ListItems';

interface AdvantageItem {
  title?: string;
  description?: string;
  image?: {
    url?: string;
    alt?: string;
  };
  list?: ListItem[];
  href?: string;
}

interface AdvantagesSectionProps {
  heading?: string;
  subheading?: string;
  advantages?: AdvantageItem[];
  // 保留 block 属性以保持向后兼容性
  block?: {
    heading?: string;
    subheading?: string;
    advantages?: AdvantageItem[];
  };
}

const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ 
  heading, 
  subheading, 
  advantages, 
  block 
}) => {
  // 优先使用直接传递的属性，如果没有则使用 block 中的属性
  const finalHeading = heading || block?.heading;
  const finalSubheading = subheading || block?.subheading;
  const finalAdvantages = advantages || block?.advantages;

  return (
    <div className="container py-10 lg:py-36">
      <div className="max-w-2xl text-center mx-auto mb-5 lg:mb-10">
        <h2 className="text-2xl font-bold md:text-4xl md:leading-tight">
          {finalHeading}
        </h2>
        <p className="mt-1 text-gray-600">
          {finalSubheading}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 lg:mb-14">
        {finalAdvantages && finalAdvantages.map((advantage, aIndex) => (
          <Link
            key={aIndex}
            className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md focus:outline-none focus:shadow-md transition"
            to={advantage.href || "#"}
          >
            <div className="aspect-w-16 aspect-h-9">
              {advantage.image?.url && (
                <Image
                  className="w-full object-cover rounded-t-xl"
                  src={advantage.image.url}
                  alt={advantage.image?.alt || advantage.title || ""}
                />
              )}
            </div>
            <div className="p-4 md:p-5">
              <h3 className="mt-2 text-2xl font-bold text-gray-800 group-hover:text-highlight">
                {advantage.title}
              </h3>
              <p className="mt-2 text-md text-gray-800">
                {advantage.description}
              </p>

              {/* 渲染列表项目 */}
              <div className="mt-3">
                <ListItems list={advantage.list} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdvantagesSection;