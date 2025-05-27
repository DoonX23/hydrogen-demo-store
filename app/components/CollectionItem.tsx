import {type FC} from 'react';
import {type CommonCollectionItemFragment} from 'storefrontapi.generated';
import {Link} from './Link';
import {Image} from '@shopify/hydrogen';
import {type FilterValue} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';

export type TMyCommonCollectionItem = Partial<CommonCollectionItemFragment> & {
  products?: {
    filters?: {
      values?: Pick<FilterValue, 'count' | 'input' | 'label'>[];
    }[];
  };
};

interface CollectionItemProps {
  item: Partial<TMyCommonCollectionItem>;
  button_text?: string;
  onClick?: () => void;
  className?: string;
}

const CollectionItem: FC<CollectionItemProps> = ({
  item,
  button_text = 'Shop now',
  onClick,
  className = '',
}) => {
  const {description, handle, title, horizontal_image, products, image} = item;

  const hImage = horizontal_image?.reference?.image;

  return (
    <Link
      to={'/collections/' + handle}
      className={clsx(`block w-full`, className)}
      onClick={onClick}
      prefetch="viewport"
    >
      <div className="flex flex-col w-full">
        <div className="relative w-full aspect-[8/7] rounded-t-2xl overflow-hidden bg-primary/5 group">
          {hImage && (
            <Image
              className="w-full h-full object-cover"
              data={hImage}
              sizes="(max-width: 640px) 90vw, (max-width: 1200px) 50vw, 40vw"
            />
          )}
          <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>
        </div>
        
        <div className="py-3 px-4 bg-primary/10 rounded-b-2xl">
          {!!title && (
            <h2
              className="text-sm md:text-lg text-slate-900 font-semibold"
              dangerouslySetInnerHTML={{__html: title}}
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export const CollectionItemSkeleton = ({
  className = '',
}: {
  className?: string;
}) => {
  return (
    <div className={clsx(`block w-full`, className)}>
      <div className="flex flex-col w-full">
        <div className="relative w-full aspect-[8/7] rounded-t-2xl overflow-hidden bg-primary/5 group">
          <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>
        </div>
        
        <div className="py-3 px-4 bg-primary/10 rounded-b-2xl">
          <h2 className="text-lg lg:text-xl text-slate-900 font-semibold">
            Skeleton Collection
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CollectionItem;