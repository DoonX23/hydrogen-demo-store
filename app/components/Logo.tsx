import React from 'react';
import {Link} from './Link';
import {Image} from '@shopify/hydrogen';
import { useRouteLoaderData } from 'react-router';
import type {RootLoader} from '~/root';

export interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = 'flex-shrink-0 max-w-28 sm:max-w-32 lg:max-w-none flex text-center',
}) => {
  const rootLoaderData = useRouteLoaderData<RootLoader>('root');

  if (!rootLoaderData) {
    return null;
  }

  const shop = rootLoaderData?.layout.shop;

  return (
    <Link
      to="/"
      className={`ttnc-logo flex-shrink-0 inline-block text-slate-900 ${className}`}
    >
      {shop.brand?.logo?.image?.url ? (
        <Image
  className="block h-5 w-20 md:h-8 md:w-32" // 移动端 h-5 (20px), 桌面端 h-8 (32px)
  data={shop.brand?.logo?.image}
  width="600"
  height="150"
  alt={shop.name + ' logo'}
/>
      ) : (
        <h1>
          <span className="text-lg sm:text-xl font-semibold line-clamp-2">
            {shop.name}
          </span>
        </h1>
      )}
    </Link>
  );
};

export default Logo;