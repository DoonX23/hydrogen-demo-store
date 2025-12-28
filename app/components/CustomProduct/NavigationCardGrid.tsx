// ~/components/CustomProduct/NavigationCardGrid.tsx
import React from 'react';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';

export type ImageType = {
  url: string;
  alt?: string;
};

export type NavigationCard = {
  title?: string;
  description?: string;
  image?: ImageType;
  href?: string;
  formType?: string; // 可以保留用于其他用途，但不用于激活判断
};

// 导出容器类型
export type NavigationCardsData = {
  product_cards?: NavigationCard[];
  capabilities_cards?: NavigationCard[];
  // 未来可以添加其他类型
  // features_cards?: NavigationCard[];
};

type NavigationCardGridProps = {
  cards: NavigationCard[];
};

// 单个卡片组件
const NavigationCardItem: React.FC<{ card: NavigationCard }> = ({ card }) => {
  const { title, description, image, href } = card;
  // 直接用 href 判断是否激活
  const isActive = href === '#';
  
  // 卡片内容组件
  const CardContent = () => (
    <div className="flex flex-col h-full">
      {/* 图片部分 */}
      {image?.url && (
        <div className="relative overflow-hidden w-full aspect-square">
          <Image
            src={image.url}
            alt={image.alt || title || ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* 内容部分 */}
      <div className="flex flex-1 flex-col px-2 py-1">
        {title && (
          <h3 className={`text-xs font-semibold text-balance text-center leading-tight ${
            isActive 
              ? 'text-white' 
              : 'group-hover:text-primary-600 transition-colors'
          }`}>
            {title}
          </h3>
        )}
        {description && (
          <p className={`mt-0.5 text-xs text-center leading-tight ${
            isActive 
              ? 'text-white/90' 
              : 'text-gray-600'
          }`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );

  // 卡片容器样式
  const cardClassName = `h-full rounded-lg overflow-hidden ${
    isActive
      ? 'bg-highlight border-2 border-primary-500'
      : 'bg-blue-100 transition-all duration-300 hover:brightness-95'
  }`;

  // 激活状态渲染为 div
  if (isActive) {
    return (
      <div className={cardClassName}>
        <CardContent />
      </div>
    );
  }

  // 非激活状态渲染为 Link
  return (
    <Link 
      to={href || '#'} 
      className="group h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
    >
      <div className={cardClassName}>
        <CardContent />
      </div>
    </Link>
  );
};

// 主组件
const NavigationCardGrid: React.FC<NavigationCardGridProps> = ({ cards }) => {
  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
        {cards.map((card, index) => (
          <NavigationCardItem 
            key={card.href || index} 
            card={card} 
          />
        ))}
      </div>
    </div>
  );
};

export default NavigationCardGrid;