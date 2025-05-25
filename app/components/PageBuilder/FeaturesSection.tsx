import React from 'react';
import { Link } from '~/components/Link'; // 假设Link组件位于这个路径
import { Image } from '@shopify/hydrogen';
import ListItems, { ListItem } from './ListItems';
import {
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

// 定义图标组件类型
type IconType = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & 
  { title?: string | undefined; titleId?: string | undefined; } & 
  RefAttributes<SVGSVGElement>
>;

interface FeatureItem {
  name?: string;
  description?: string;
  icon?: string;
  list?: ListItem[];
}

interface FeaturesSectionProps {
  tagline?: string;
  taglineLink?: string;
  taglineLinkText?: string;
  heading?: string;
  description?: string;
  features?: FeatureItem[];
  // 保留 block 属性以保持向后兼容性
  block?: {
    tagline?: string;
    taglineLink?: string;
    taglineLinkText?: string;
    heading?: string;
    description?: string;
    features?: FeatureItem[];
  };
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  tagline,
  taglineLink,
  taglineLinkText,
  heading,
  description,
  features,
  block 
}) => {
  // 优先使用直接传递的属性，如果没有则使用 block 中的属性
  const finalTagline = tagline || block?.tagline;
  const finalTaglineLink = taglineLink || block?.taglineLink;
  const finalTaglineLinkText = taglineLinkText || block?.taglineLinkText;
  const finalHeading = heading || block?.heading;
  const finalDescription = description || block?.description;
  const finalFeatures = features || block?.features;

  // 图标映射 - 使用正确的类型
  const iconMap: {[key: string]: IconType} = {
    ArrowPathIcon,
    Bars3Icon,
    CloudArrowUpIcon,
    FingerPrintIcon,
    LockClosedIcon,
    XMarkIcon
  };

  return (
    <div className="container py-10 lg:py-36">
      <div className="mx-auto max-w-2xl lg:text-center">
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
        <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
          {finalHeading}
        </p>
        <p className="mt-6 text-lg/8 text-pretty text-gray-600">
          {finalDescription}
        </p>
      </div>
      <div className="mx-auto mt-16 container sm:mt-20 lg:mt-24">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          {finalFeatures && finalFeatures.map((feature, fIndex) => {
            // 安全地获取图标组件
            const iconName = feature.icon as keyof typeof iconMap;
            // 如果图标名称存在于映射中，则使用它，否则使用默认图标
            const IconComponent = (iconName && iconMap[iconName]) || CloudArrowUpIcon;
            
            return (
              <div key={fIndex} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-brand">
                    <IconComponent
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">
                  {feature.description}
                </dd>
                {/* 渲染列表项目 */}
                <div className="mt-2">
                  <ListItems list={feature.list} />
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

export default FeaturesSection;