import {Money} from '@shopify/hydrogen';
import {type Maybe, type MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {type FC} from 'react';

export interface PricesProps {
  className?: string;
  price?: Pick<MoneyV2, 'amount' | 'currencyCode'>;
  compareAtPrice?: Maybe<Pick<MoneyV2, 'amount' | 'currencyCode'>>;
  contentClass?: string;
  compareAtPriceClass?: string;
  withoutTrailingZeros?: boolean;
}

const Prices: FC<PricesProps> = ({
  className = '',
  price,
  compareAtPrice,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  compareAtPriceClass = 'text-xs text-slate-500',
  withoutTrailingZeros,
}) => {
  return (
    <div className={`${className}`}>
      <div
        className={`flex items-center border-2 border-highlight rounded-lg ${contentClass}`}
      >
        {price ? (
          <Money
            withoutTrailingZeros={withoutTrailingZeros}
            className="text-highlight !leading-none"
            data={price}
          />
        ) : null}
        {compareAtPrice ? (
          <s className={`ms-1 ${compareAtPriceClass}`}>
            <Money
              withoutTrailingZeros={withoutTrailingZeros}
              data={compareAtPrice}
            />
          </s>
        ) : null}
      </div>
    </div>
  );
};

export default Prices;
