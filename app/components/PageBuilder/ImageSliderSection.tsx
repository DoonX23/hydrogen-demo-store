import React, { useRef } from 'react';
import { Link } from '~/components/Link'; // 引入Link组件
import { Image } from '@shopify/hydrogen'; // 引入Image组件
import useSnapSlider from '~/hooks/useSnapSlider';
import NextPrev from '~/components/NextPrev/NextPrev';
import ListItems, { ListItem } from './ListItems';

// 定义图片项类型
export interface ImageItem {
  image?: {
    url?: string;
    altText?: string;
  };
  title?: string;
  description?: string;
  list?: ListItem[];
  link?: string;
}

// 定义组件属性类型
export interface ImageSliderSectionProps {
  block?: {
    heading?: string;
    subheading?: string;
    items?: ImageItem[];
  };
}

const ImageSliderSection: React.FC<ImageSliderSectionProps> = ({ block }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { scrollToNextSlide, scrollToPrevSlide } = useSnapSlider({ sliderRef });
  
  return (
    <>
      <div className="max-w-2xl text-center mx-auto mb-8">
        <h2 className="text-3xl font-bold md:text-4xl md:leading-tight text-gray-900">
          {block?.heading}
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          {block?.subheading}
        </p>
      </div>

      {block?.items && block.items.length > 0 && (
        <div className="relative px-4">
          <div 
            ref={sliderRef}
            className="relative w-full flex gap-4 lg:gap-8 snap-x snap-mandatory overflow-x-auto hiddenScrollbar"
          >
            <div className="w-0"></div>
            {block.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="mySnapItem snap-start shrink-0 last:pr-4 lg:last:pr-10"
              >
                {/* 正方形项目容器 */}
                <div className="w-64 sm:w-72 lg:w-80 xl:w-96">
                  <Link
                    to={item.link || "#"}
                    className="group relative block aspect-square overflow-hidden rounded-lg"
                  >
                    {item.image?.url && (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText || item.title || ""}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-xl font-semibold text-white group-hover:text-highlight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-white text-sm truncate">
                        {item.description}
                      </p>
                        
                      {/* 简化版列表渲染 (由于空间限制) */}
                      {item.list && item.list.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.list.map((listItem, listIdx) => (
                            <span 
                              key={listIdx}
                              className={`text-xs py-1 px-2 rounded-full ${
                                listItem.highlighted 
                                  ? 'bg-brand text-white' 
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              {listItem.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* 滑块控制按钮 - 居中显示 */}
          <div className="mt-10 flex justify-center">
            <NextPrev onClickNext={scrollToNextSlide} onClickPrev={scrollToPrevSlide} />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSliderSection;