import {Image} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import {PhotoIcon} from '@heroicons/react/24/outline';
import type {MediaFragment} from 'storefrontapi.generated';
import type {Image as ImageType} from '@shopify/hydrogen/storefront-api-types';

// 骨架屏组件
const GallerySkeleton = () => {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {/* 移动端骨架屏 */}
        <div className="md:hidden">
          <div className="aspect-square bg-gray-200 rounded-lg" />
        </div>
        {/* 桌面端骨架屏 */}
        <div className="hidden md:flex gap-8">
          <div className="w-16 space-y-3">
            {[1,2,3,4].map((n) => (
              <div key={n} className="aspect-square bg-gray-200 rounded" />
            ))}
          </div>
          <div className="flex-1">
            <div className="aspect-square bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 占位符组件 
const GalleryPlaceholder = () => {
  return (
    <div className="w-full">
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <PhotoIcon className="w-20 h-20 text-gray-400" />
      </div>
    </div>
  );
};

const getImageData = (med: MediaFragment) => {
  if (med.__typename === 'MediaImage' && med.image) {
    return {
      ...med.image,
      altText: med.alt || 'Product image'
    } as ImageType;
  }
  return undefined;
};

export function CustomProductGallery({
  media,
  className,
  isLoading,
}: {
  media: MediaFragment[];
  className?: string;
  isLoading?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [media]);

  if (isLoading) return <GallerySkeleton />;
  if (!media.length) return <GalleryPlaceholder />;
  
  return (
    <div
      className={`swimlane md:grid-flow-row hiddenScroll md:p-0 md:overflow-x-auto md:grid-cols-2 ${className}`}
    >
      {/* 移动端布局 */}
      {media.map((med, i) => {
        const image = getImageData(med);
        if (!image) return null;

        return (
          <div
            className="md:hidden aspect-square snap-center card-image bg-white dark:bg-contrast/10 w-mobileGallery md:w-full"
            key={med.id}
          >
            <Image
              loading={i === 0 ? 'eager' : 'lazy'}
              data={image}
              sizes="90vw"
              className="object-cover w-full h-full aspect-square fadeIn"
            />
          </div>
        );
      })}

      {/* 大屏布局 */}
      <div className="hidden md:flex md:gap-8 md:col-span-2">
      {/* 左侧缩略图列表 - 将宽度从w-24(96px)改为w-20(80px) */}
      <div className="flex flex-col w-16 gap-3">
          {media.map((med, i) => {
          const image = getImageData(med);
          if (!image) return null;

          return (
              <div 
              key={med.id}
              className={`
                  aspect-square cursor-pointer
                  ${currentIndex === i ? 'border-2 border-brand' : ''}
              `}
              onMouseEnter={() => setCurrentIndex(i)}
              >
              <Image
                  data={image}
                  loading="lazy"
                  sizes="64px" // 修改尺寸从96px到64px
                  className="object-cover w-full h-full"
              />
              </div>
          );
          })}
      </div>

      {/* 右侧大图 */}
      <div className="flex-1">
          {getImageData(media[currentIndex]) && (
          <Image
              data={getImageData(media[currentIndex])!}
              loading="eager" 
              sizes="(min-width: 48em) 60vw, 90vw"
              className="object-cover w-full aspect-square"
          />
          )}
      </div>
      </div>
    </div>
  );
}
