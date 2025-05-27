import Heading from '~/components/Heading/Heading';
import {useRef} from 'react';
import useSnapSlider from '~/hooks/useSnapSlider';
import CollectionItem, {
  CollectionItemSkeleton,
  type TMyCommonCollectionItem,
} from '~/components/CollectionItem';

export const CollectionSlider = ({
  heading_bold,
  heading_light,
  sub_heading,
  button_text,
  collections = [],
  headingFontClass,
  isSkeleton,
}: {
  heading_bold?: string;
  heading_light?: string;
  sub_heading?: string;
  collections?: TMyCommonCollectionItem[];
  button_text?: string;
  headingFontClass?: string;
  isSkeleton?: boolean;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const {scrollToNextSlide, scrollToPrevSlide} = useSnapSlider({sliderRef});

  return (
    <div className={`nc-DiscoverMoreSlider mb-4 sm:mb-6 md:mb-8`}>
      <Heading
        className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50 container"
        desc={sub_heading || ''}
        rightDescText={heading_light || ''}
        hasNextPrev
        onClickNext={scrollToNextSlide}
        onClickPrev={scrollToPrevSlide}
        fontClass={headingFontClass}
      >
        {heading_bold || ''}
      </Heading>
      <div className="">
        <div
          ref={sliderRef}
          className="relative w-full flex gap-4 lg:gap-8 snap-x snap-mandatory overflow-x-auto scroll-p-l-container hiddenScrollbar"
        >
          <div className="w-0 nc-p-l-container"></div>
          {isSkeleton
            ? [1, 1, 1, 1, 1].map((_, index) => (
                <div
                  key={index}
                  className="mySnapItem snap-start shrink-0 last:pr-4 lg:last:pr-10"
                >
                  <div className="w-64 sm:w-96 flex">
                    <CollectionItemSkeleton key={index} />
                  </div>
                </div>
              ))
            : collections.filter(Boolean).map((item, index) => (
                <div
                  key={`${item.id}`}
                  className="mySnapItem snap-start shrink-0 last:pr-4 lg:last:pr-10"
                >
                  <div className="w-64 sm:w-96 flex">
                    <CollectionItem item={item} button_text={button_text} />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
