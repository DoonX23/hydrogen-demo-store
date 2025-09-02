// ~/components/PageBuilder/CardGridSection.tsx
import React from 'react';
import { Link } from 'react-router';
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
    sectionStyles?: {
      section?: string;
      container?: string;
      headerWrapper?: string;
      heading?: string;
      subheading?: string;
    };
    cardStyles?: {
      title?: string;
      description?: string;
      readMore?: string;
      card?: string;
      cardContent?: string;
      image?: string;
      imageAspect?: string;
    };
  };
};

// 卡片组件
const CardItem: React.FC<{ 
  card: Card; 
  layout: 'imageLeft' | 'imageTop';
  styles: {
    title: string;
    description: string;
    readMore: string;
    card: string;
    cardContent: string;
    image: string;
    imageAspect: string;
  };
}> = ({ card, layout, styles }) => {
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
    ? 'flex flex-col md:flex-row' // 移动端垂直排列，桌面端水平排列
    : 'flex flex-col'; // 始终垂直排列

  // 图片容器样式，包含自定义的宽高比
  const imageWrapperClass = layout === 'imageLeft'
    ? `shrink-0 relative overflow-hidden w-full md:w-2/5 ${styles.imageAspect}` // 桌面端占2/5宽度
    : `shrink-0 relative overflow-hidden w-full ${styles.imageAspect}`; // 全宽度

  // 内容包装器组件，根据是否有链接决定渲染Link还是div
  const ContentWrapper = href 
    ? ({ children }: { children: React.ReactNode }) => (
        <Link to={href} className="group h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div className="h-full">{children}</div>;

  return (
    <ContentWrapper>
      <div className={styles.card}>
        <div className={cardLayoutClass}>
          {/* 图片部分 */}
          {image?.url && (
            <div className={imageWrapperClass}>
              <Image
                src={image.url}
                alt={image.alt || title || ''}
                className={styles.image}
              />
            </div>
          )}
          
          {/* 内容部分 */}
          <div className={styles.cardContent}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
            {list && <ListItems list={list} />}
            
            {/* 阅读更多链接 */}
            {href && readMore && (
              <div className="mt-auto pt-4">
                <span className={styles.readMore}>
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
    columns = cardLayout === 'imageLeft' ? 2 : 3,
    sectionStyles,
    cardStyles,
  } = block;

  // 默认区块样式
  const defaultSectionStyles = {
    section: 'bg-white py-12 md:py-16',
    container: 'container mx-auto px-4',
    headerWrapper: 'mb-8 md:mb-12 text-center',
    heading: 'text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900 text-balance',
    subheading: 'text-lg/8 text-gray-600 max-w-3xl mx-auto',
  };

  // 默认卡片样式
  const defaultCardStyles = {
    title: 'text-xl font-semibold group-hover:text-primary-600 group-focus:text-primary-600 transition-colors text-balance',
    description: 'mt-2 text-gray-600',
    readMore: 'text-highlight font-bold group-hover:text-brand group-focus:text-brand transition-colors inline-flex items-center gap-x-1',
    card: 'h-full bg-gray-100 transition-all duration-300 ease-out hover:brightness-95 overflow-hidden rounded-lg',
    cardContent: 'flex flex-1 flex-col p-3 sm:p-4',
    image: 'w-full h-full object-cover',
    imageAspect: 'aspect-[4/3]',
  };

  // 合并样式
  const mergedSectionStyles = {
    section: sectionStyles?.section || defaultSectionStyles.section,
    container: sectionStyles?.container || defaultSectionStyles.container,
    headerWrapper: sectionStyles?.headerWrapper || defaultSectionStyles.headerWrapper,
    heading: sectionStyles?.heading || defaultSectionStyles.heading,
    subheading: sectionStyles?.subheading || defaultSectionStyles.subheading,
  };

  const mergedCardStyles = {
    title: cardStyles?.title || defaultCardStyles.title,
    description: cardStyles?.description || defaultCardStyles.description,
    readMore: cardStyles?.readMore || defaultCardStyles.readMore,
    card: cardStyles?.card || defaultCardStyles.card,
    cardContent: cardStyles?.cardContent || defaultCardStyles.cardContent,
    image: cardStyles?.image || defaultCardStyles.image,
    imageAspect: cardStyles?.imageAspect || defaultCardStyles.imageAspect,
  };

  // 根据布局和列数确定 CSS 类名
  const getGridClass = () => {
    if (cardLayout === 'imageLeft') {
      // 左图右内容支持 1-4 列
      const validColumns = Math.min(Math.max(1, columns), 4);
      switch (validColumns) {
        case 1:
          return 'grid grid-cols-1 gap-8 max-w-2xl mx-auto';
        case 2:
          return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
        case 3:
          return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
        case 4:
          return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
        default:
          return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
      }
    } else {
      // 上图下内容支持 1-6 列
      const validColumns = Math.min(Math.max(1, columns), 6);
      switch (validColumns) {
        case 1:
          return 'grid grid-cols-1 gap-8 max-w-md mx-auto';
        case 2:
          return 'grid grid-cols-1 sm:grid-cols-2 gap-6';
        case 3:
          return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        case 4:
          return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
        case 5:
          return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6';
        case 6:
          return 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6';
        default:
          return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      }
    }
  };

  return (
    <section className={mergedSectionStyles.section}>
      <div className={mergedSectionStyles.container}>
        {/* 标题部分 */}
        {(heading || subheading) && (
          <div className={mergedSectionStyles.headerWrapper}>
            {heading && (
              <h2 className={mergedSectionStyles.heading}>{heading}</h2>
            )}
            {subheading && (
              <p className={mergedSectionStyles.subheading}>{subheading}</p>
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
              styles={mergedCardStyles}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardGridSection;