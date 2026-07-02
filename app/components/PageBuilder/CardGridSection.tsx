// ~/components/PageBuilder/CardGridSection.tsx
import React from 'react';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';
import ListItems, { ListItem } from './ListItems';

// ==========================================
// 原生原生映射字典 (替代 CVA)
// ==========================================

const getSectionClasses = (theme: string = 'gray') => {
  const themes: Record<string, string> = {
    light: 'bg-white text-gray-900',
    gray: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-900 text-white',
  };
  return `py-12 md:py-16 transition-colors duration-300 ${themes[theme] || themes.gray}`;
};

const getTextClasses = (theme: string = 'gray', isHeading: boolean = false) => {
  const themes: Record<string, string> = {
    light: 'text-gray-600',
    gray: 'text-gray-600',
    dark: 'text-gray-300',
  };
  const base = isHeading ? '!text-inherit text-balance font-bold tracking-tight' : themes[theme] || themes.gray;
  return base;
};

const getCardClasses = (layout: string = 'imageLeft', style: string = 'flat') => {
  const layouts: Record<string, string> = {
    imageLeft: 'flex-col md:flex-row',
    imageTop: 'flex-col',
  };
  const styles: Record<string, string> = {
    flat: 'bg-gray-100 hover:brightness-95 rounded-lg',
    shadow: 'bg-white shadow-md hover:shadow-xl rounded-xl',
    bordered: 'bg-transparent border border-gray-200 hover:border-primary-500 rounded-lg',
  };
  return `group h-full flex overflow-hidden transition-all duration-300 ease-out ${layouts[layout] || layouts.imageLeft} ${styles[style] || styles.flat}`;
};

const getImageWrapperClasses = (layout: string = 'imageLeft', aspect: string = '4/3') => {
  const layouts: Record<string, string> = {
    imageLeft: 'md:w-2/5',
    imageTop: 'w-full',
  };
  const aspects: Record<string, string> = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '1/1': 'aspect-square',
  };
  return `shrink-0 relative overflow-hidden w-full ${layouts[layout] || layouts.imageLeft} ${aspects[aspect] || aspects['4/3']}`;
};

// ==========================================
// 类型定义
// ==========================================

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
    theme?: 'light' | 'gray' | 'dark';
    cardStyle?: 'flat' | 'shadow' | 'bordered';
    imageAspect?: '4/3' | '16/9' | '1/1';
  };
};

// ==========================================
// 单个卡片组件
// ==========================================

const CardItem: React.FC<{ 
  card: Card; 
  layout: 'imageLeft' | 'imageTop';
  cardStyle: 'flat' | 'shadow' | 'bordered';
  imageAspect: '4/3' | '16/9' | '1/1';
  theme: 'light' | 'gray' | 'dark';
}> = ({ card, layout, cardStyle, imageAspect, theme }) => {
  const { title, description, list, image, href, readMore } = card;

  const ContentWrapper = href 
    ? ({ children }: { children: React.ReactNode }) => (
        <Link to={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div className="h-full">{children}</div>;

  return (
    <ContentWrapper>
      <div className={getCardClasses(layout, cardStyle)}>
        
        {/* 图片部分 */}
        {image?.url && (
          <div className={getImageWrapperClasses(layout, imageAspect)}>
            <Image
              src={image.url}
              alt={image.alt || title || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        
        {/* 内容部分 */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {title && (
            <h3 className={`text-xl font-semibold mb-2 transition-colors ${theme === 'dark' && cardStyle === 'flat' ? 'text-gray-900' : 'text-inherit'} group-hover:text-primary-600`}>
              {title}
            </h3>
          )}
          
          {description && (
            <p className={`mt-2 ${theme === 'dark' && cardStyle === 'flat' ? 'text-gray-600' : getTextClasses(theme, false)}`}>
              {description}
            </p>
          )}
          
          {list && (
            <div className="mt-4">
              <ListItems list={list} />
            </div>
          )}
          
          {/* 阅读更多链接 */}
          {href && readMore && (
            <div className="mt-auto pt-5">
              <span className="text-highlight font-bold group-hover:text-brand transition-colors inline-flex items-center gap-x-1">
                {readMore}
                <svg 
                  className="shrink-0 size-4 transition-transform group-hover:translate-x-1" 
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
    </ContentWrapper>
  );
};

// ==========================================
// 主区块组件
// ==========================================

const CardGridSection: React.FC<CardGridSectionProps> = ({ block }) => {
  const { 
    heading, 
    subheading, 
    cards = [], 
    cardLayout = 'imageLeft', 
    columns = cardLayout === 'imageLeft' ? 2 : 3,
    theme = 'gray',
    cardStyle = 'flat',
    imageAspect = '4/3',
  } = block;

  const getGridClass = () => {
    if (cardLayout === 'imageLeft') {
      const validColumns = Math.min(Math.max(1, columns), 4);
      switch (validColumns) {
        case 1: return 'grid grid-cols-1 gap-8 max-w-3xl mx-auto';
        case 2: return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
        case 3: return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6';
        case 4: return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6';
        default: return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
      }
    } else {
      const validColumns = Math.min(Math.max(1, columns), 6);
      switch (validColumns) {
        case 1: return 'grid grid-cols-1 gap-8 max-w-md mx-auto';
        case 2: return 'grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8';
        case 3: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8';
        case 4: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
        case 5: return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6';
        case 6: return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6';
        default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8';
      }
    }
  };

  return (
    <section className={getSectionClasses(theme)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题部分 */}
        {(heading || subheading) && (
          <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
            {heading && (
              <h2 className={`text-3xl md:text-4xl mb-4 ${getTextClasses(theme, true)}`}>
                {heading}
              </h2>
            )}
            {subheading && (
              <p className={`text-lg md:text-xl leading-relaxed ${getTextClasses(theme, false)}`}>
                {subheading}
              </p>
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
              cardStyle={cardStyle}
              imageAspect={imageAspect}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardGridSection;