// ~/components/PageBuilder/CardGridSection.tsx
import React from 'react';
import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import ListItems, { ListItem } from './ListItems';

// 类型定义
type ImageType = {
  url: string;
  alt?: string;
};

type Card = {
  title?: string;
  description?: string;
  list?: ListItem[];
  image?: ImageType;
  href?: string;
  readMore?: string;
};

type CardGridSectionProps = {
  block: {
    heading?: string;
    subheading?: string;
    cards?: Card[];
    cardLayout?: 'imageLeft' | 'imageTop';
    columns?: number;
    background?: 'white' | 'lightGray' | 'brand';
    spacing?: 'tight' | 'normal' | 'loose';
  };
};

// 卡片组件
const CardItem: React.FC<{ 
  card: Card; 
  layout: 'imageLeft' | 'imageTop';
}> = ({ card, layout }) => {
  const { 
    title, 
    description, 
    list, 
    image, 
    href, 
    readMore
  } = card;

  // 根据区块级布局确定卡片布局样式
  const cardLayoutClass = layout === 'imageLeft'
    ? 'flex flex-col md:flex-row gap-6'
    : 'flex flex-col gap-6';

  const imageWrapperClass = layout === 'imageLeft'
    ? 'shrink-0 relative rounded-xl overflow-hidden w-full md:w-2/5 aspect-video' // 左图右内容时的图片容器
    : 'shrink-0 relative rounded-xl overflow-hidden w-full aspect-video'; // 上图下内容时的图片容器，固定宽高比

  const ContentWrapper = href 
    ? ({ children }: { children: React.ReactNode }) => (
        <Link to={href} className="group h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div className="h-full">{children}</div>;

  return (
    <ContentWrapper>
      <div className="h-full rounded-lg border border-gray-200 p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className={cardLayoutClass}>
          {/* 图片部分 */}
          {image?.url && (
            <div className={imageWrapperClass}>
              <Image
                src={image.url}
                alt={image.alt || title || ''}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
          )}
          
          {/* 内容部分 */}
          <div className="flex flex-1 flex-col">
            {title && <h3 className="text-xl font-semibold group-hover:text-primary-600 group-focus:text-primary-600 transition-colors text-balance">{title}</h3>}
            {description && <p className="mt-2 text-gray-600">{description}</p>}
            
            {/* 列表项 */}
            {list && <ListItems list={list} />}
            
            {/* 阅读更多链接 */}
            {href && readMore && (
              <div className="mt-auto pt-4">
                <span className="text-primary-600 font-medium group-hover:text-primary-500 group-focus:text-primary-500 transition-colors inline-flex items-center gap-x-1">
                  {readMore}
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
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

// 主组件
const CardGridSection: React.FC<CardGridSectionProps> = ({ block }) => {
  const { 
    heading, 
    subheading, 
    cards = [], 
    cardLayout = 'imageLeft', 
    columns = cardLayout === 'imageLeft' ? 2 : 3, // 默认列数基于布局
    background = 'white',
    spacing = 'normal'
  } = block;

  // 根据布局和列数确定 CSS 类名
  const getGridClass = () => {
    if (cardLayout === 'imageLeft') {
      // 左图右内容固定为 2 列
      return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
    }
    
    // 上图下内容支持 1-4 列
    const validColumns = Math.min(Math.max(1, columns), 4);
    switch (validColumns) {
      case 1:
        return 'grid grid-cols-1 gap-8 max-w-md mx-auto';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-6';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 4:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // 根据背景确定CSS类名
  const bgClass = {
    white: 'bg-white',
    lightGray: 'bg-gray-50',
    brand: 'bg-primary-50',
  }[background] || 'bg-white';

  // 根据间距确定CSS类名
  const spacingClass = {
    tight: 'py-8 md:py-12',
    normal: 'py-12 md:py-16',
    loose: 'py-16 md:py-24',
  }[spacing] || 'py-12 md:py-16';

  return (
    <section className={`${bgClass} ${spacingClass}`}>
      <div className="container mx-auto px-4">
        {/* 标题部分 */}
        {(heading || subheading) && (
          <div className="mb-8 md:mb-12 text-center">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900 text-balance">{heading}</h2>
            )}
            {subheading && (
              <p className="text-lg/8 text-gray-600 max-w-3xl mx-auto">{subheading}</p>
            )}
          </div>
        )}
        
        {/* 卡片网格 */}
        <div className={getGridClass()}>
          {cards.map((card, index) => (
            <CardItem 
              key={index} 
              card={card} 
              layout={cardLayout} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardGridSection;