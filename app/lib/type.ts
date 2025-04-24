import type {Storefront as HydrogenStorefront} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';

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
  stockSizes?: string;
  widthOptions?: Array<{
    id: string;
    value: string;
    label: string;
  }>;
  [key: string]: number | string | any[] | undefined;
}
