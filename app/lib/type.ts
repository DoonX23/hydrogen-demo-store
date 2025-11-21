import type {Storefront as HydrogenStorefront} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';
import type {ProductQuery} from 'storefrontapi.generated';
import type {MetafieldNavigatorProps} from '~/components/CustomProduct/ProductMetafieldNavigator';

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Storefront = HydrogenStorefront<I18nLocale>;

//为了避免DimensionLimitation 的type重复，所以封装提取到这个地方；
export type DimensionLimitation = {
  maxLength?: number;
  minLength?: number;
  maxWidth?: number;
  minWidth?: number;
  minInnerDiameter?: number;    // 新增
  maxInnerDiameter?: number;    // 新增
  minOuterDiameter?: number;    // 新增
  maxOuterDiameter?: number;    // 新增
  minDiameter?: number;        // 新增：Disc最小直径
  maxDiameter?: number;        // 新增：Disc最大直径
  stockSizes?: string;
  widthOptions?: Array<{
    id: string;
    value: string;
    label: string;
  }>;
  [key: string]: number | string | any[] | undefined;
}

// 自定义表单组件通用Props
export interface CustomFormProps {
  product: NonNullable<ProductQuery['product']>;  // 关键修改
  facets: MetafieldNavigatorProps['options'];
  productMetafields: MetafieldNavigatorProps['variants'];
  onError: (hasError: boolean) => void;
}