import { useRef, Suspense, useState, useEffect } from 'react';
import { Disclosure, Listbox } from '@headlessui/react';
import {
  data,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData, Await, useNavigate } from 'react-router';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getProductOptions,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';

import type {ProductFragment} from 'storefrontapi.generated';
import {Heading, Section, Text} from '~/components/Text';
import { Link } from '~/components/Link';
import { Button } from '~/components/Button';
import { AddToCartButton } from '~/components/AddToCartButton';
import { Skeleton } from '~/components/Skeleton';
import { ProductSwimlane } from '~/components/ProductSwimlane';
import { ProductGallery } from '~/components/ProductGallery';
import { IconCaret, IconCheck, IconClose } from '~/components/Icon';
import { getExcerpt } from '~/lib/utils';
import { seoPayload } from '~/lib/seo.server';
import type { Storefront } from '~/lib/type';
import { routeHeaders } from '~/data/cache';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { CustomProductForm } from '~/components/CustomProduct/CustomProductForm';
import { SlashIcon } from '@heroicons/react/24/solid';
import { CustomProductGallery } from '~/components/CustomProductGallery';
import { FeaturedCollections } from '~/components/FeaturedCollections';
import {
  COMMON_COLLECTION_ITEM_FRAGMENT,
  COMMON_PRODUCT_CARD_FRAGMENT,
  LINK_FRAGMENT,
  MEDIA_IMAGE_FRAGMENT,
  OKENDO_PRODUCT_REVIEWS_FRAGMENT,
  OKENDO_PRODUCT_STAR_RATING_FRAGMENT,
} from '~/data/commonFragments';
import { CollectionSlider } from '~/components/CollectionsSlider';
import { HubspotForm } from '~/components/HubspotForm';
import ProductAnchor from '~/components/ProductAnchor.client';
import { ProductDescriptionSection } from '~/components/ProductDescriptionSection';
import ProductSpecifications from '~/components/ProductSpecifications';
import NcInputNumber from '~/components/NcInputNumber';
import Prices from '~/components/Prices';
import { OkendoReviews, OkendoStarRating } from '@okendo/shopify-hydrogen';
import NavigationCardGrid, { type NavigationCardsData } from '~/components/CustomProduct/NavigationCardGrid';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const { productHandle } = args.params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  params,
  request,
  context,
}: LoaderFunctionArgs) {
  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const [{ shop, product }] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response('product', { status: 404 });
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? {};
  const variants = getAdjacentAndFirstAvailableVariants(product);

  const seo = seoPayload.product({
    product: {...product, variants},
    selectedVariant,
    url: request.url,
  });

  return {
    product,
    variants,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    seo,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ params, context }: LoaderFunctionArgs) {
  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // 修改: 将collection查询结果存储为Promise
  const collectionQueryPromise = context.storefront.query(Collection_Handle_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });
  // 处理collection数据的Promise
  const collectionDataPromise = collectionQueryPromise.then(({ product }) => {
    const productMetafields = product?.collections?.edges[0]?.node?.products?.nodes || [];
    const beforeFilters = product?.collections?.nodes[0]?.products.filters || [];
    // 转换filters格式
    const filters = beforeFilters
      // 重命名字段
      .map(filter => ({
        name: filter.label,
        optionValues: filter.values.map(value => ({
          name: value.label
        }))
      }))
      // 过滤掉optionValues长度为1的filter
      .filter(filter => filter.optionValues.length > 1);

    // 获取filters中的名称（转为小写以便比较）
    const filterNames = filters.map(filter => filter.name.toLowerCase());
    // 过滤productMetafields中的空值，只获取filters中存在的key；
    const filteredMetafields = productMetafields.map(product => ({
      metafields: product.metafields
        .filter(metafield => metafield != null)
        .filter(metafield => filterNames.includes(metafield.key)),
      handle: product.handle
    }));
    return {
      filters,
      filteredMetafields
    };
  });

  return {
    collectionDataPromise,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Product() {
  const { product, shop, recommended, variants, storeDomain, collectionDataPromise } = useLoaderData<typeof loader>();
  const { media, title, vendor, descriptionHtml } = product;
  const { shippingPolicy, refundPolicy } = shop;
  const collection = product.collections.nodes[0];
  const specifications = product.specifications?.value
    ? JSON.parse(product.specifications.value) as Record<string, any[]>
    : {};

  // 2. 修改解析逻辑
  const navigationCardsData: NavigationCardsData = (() => {
    try {
      const value = product.navigation_cards?.value;
      if (!value) return {};
      
      const parsed = JSON.parse(value) as NavigationCardsData;
      return parsed;
    } catch (error) {
      console.error('Failed to parse navigation_cards:', error);
      return {};
    }
  })();

  const productCards = navigationCardsData.product_cards || [];
  const capabilitiesCards = navigationCardsData.capabilities_cards || [];

  // 添加一个state来跟踪是否在客户端,在组件挂载后设置isClient为true
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const productSections = [
    { id: 'description', title: 'Description' },
    { id: 'specifications', title: 'Specifications' },
    { id: 'reviews', title: 'Reviews' },
    //{ id: 'shipping', title: 'Shipping' },
    //{ id: 'return', title: 'Return' }
  ];

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  return (<>
    <section className="container">
      {!!collection && (
        <nav className="my-4 lg:my-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  to={'/'}
                  className="font-medium text-gray-500 hover:text-gray-900"
                >
                  Home
                </Link>
                <SlashIcon className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300 " />
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <Link
                  to={'/collections/' + collection.handle}
                  className="font-medium text-gray-500 hover:text-gray-900"
                >
                  {/* romove html on title */}
                  {collection.title.replace(/(<([^>]+)>)/gi, '')}
                </Link>
              </div>
            </li>
          </ol>
        </nav>
      )}
      <div className="grid items-start lg:gap-20 lg:grid-cols-2">
        <CustomProductGallery
          key={product.id}
          media={media.nodes}
          isLoading={!product}
          className="w-full lg:col-span-1"
        />
        {capabilitiesCards.length > 0 && (
          <NavigationCardGrid cards={capabilitiesCards} />
        )}
        <div className="">
          <section className="flex flex-col w-full gap-8 md:mx-auto md:px-0 py-4 lg:py-0">
            <div className="grid gap-2">
              <Heading as="h1" className="whitespace-normal text-xl md:text-[1.5rem]">
                {title}
              </Heading>
              <OkendoStarRating
                className="mb-4"
                productId={product.id}
                okendoStarRatingSnippet={product.okendoStarRatingSnippet}
              />
            </div>
            <div className="grid">
              <div className="grid text-center">
                <HubspotForm buttonText="Get Exclusive Custom & Bulk Quote" />
              </div>
              {/*
              {descriptionHtml && (
                <ProductDetail
                  title="Product Details"
                  content={descriptionHtml}
                />
              )}
              {shippingPolicy?.body && (
                <ProductDetail
                  title="Shipping"
                  content={getExcerpt(shippingPolicy.body)}
                  learnMore={`/policies/${shippingPolicy.handle}`}
                />
              )}
              {refundPolicy?.body && (
                <ProductDetail
                  title="Returns"
                  content={getExcerpt(refundPolicy.body)}
                  learnMore={`/policies/${refundPolicy.handle}`}
                />
              )}
                */}
            </div>
             {/*{!!collection && (
              <div className="flex">
                <div className="relative rounded-xl px-3 py-1 text-sm/6 text-gray-600 dark:text-gray-300 ring-1 ring-brand dark:ring-white hover:ring-highlight hover:text-highlight">
                  View All {collection.title.replace(/(<([^>]+)>)/gi, '')} Options{" "}
                  <Link
                    to={'/collections/' + collection.handle}
                    className="font-semibold text-brand dark:text-highlight"
                  >
                    <span aria-hidden="true" className="absolute inset-0" />
                    Reach Out <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            )}*/}
            {/* 在产品图片和表单之前添加导航卡片 */}
            {productCards.length > 0 && (
              <NavigationCardGrid cards={productCards} />
            )}
            {product.customizable_size?.value === "true" ? (
              <Suspense fallback={<CustomProductForm product={product} facets={[]} productMetafields={[]} />}>
                <Await resolve={collectionDataPromise}>
                  {(data) => (
                    <CustomProductForm
                      key={product.id} 
                      product={product}
                      facets={data.filters}
                      productMetafields={data.filteredMetafields}
                    />
                  )}
                </Await>
              </Suspense>
            ) : (
              <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              storeDomain={storeDomain}
            />
            )}

          </section>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-32" />}>
      <Await
        errorElement="There was a problem loading related products"
        resolve={recommended}
      >
        {(products) => (
          <ProductSwimlane title="Related Products" products={products} />
        )}
      </Await>
    </Suspense>
    </section>
    <div className="mb-12 sm:mb-16 mt-4">
      {/* 仅在客户端渲染ProductAnchor组件，服务端则渲染替代内容 */}
      {isClient ? (
        <ProductAnchor sections={productSections} />
      ) : (
        <div className="sticky top-[60px] md:top-[80px] w-full bg-white z-10 shadow-sm">
          <div className="max-w-6xl mx-auto">
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex gap-4 border-b w-full py-3 min-w-max">
                {productSections.map(section => (
                  <span key={section.id} className="px-2 cursor-pointer whitespace-nowrap">
                    {section.title}
                  </span>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 产品详情内容区域 */}
      <div className="mt-6 container">
        {/* 原有代码替换为 */}
        <ProductDescriptionSection product={product} />

        {/* 规格参数部分 - 只有当product.specifications?.value存在时才显示 - 这是第2个锚点 */}
        {product.specifications?.value && (<ProductSpecifications specifications={specifications} />)}
        
        <div id="reviews">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <OkendoReviews
          productId={product.id}
          okendoReviewsSnippet={product.okendoReviewsSnippet}
        /></div>
        
        {/* shipping部分 - 这是第3个锚点
        {!!shippingPolicy?.body && (
          <div id="shipping" className="pb-8 md:pb-12">
            <h2 className="text-2xl font-semibold">Shipping Policy</h2>
            <div
              className="prose prose-sm sm:prose dark:prose-invert sm:max-w-4xl mt-7"
              dangerouslySetInnerHTML={{
                __html: getExcerpt(shippingPolicy.body) || '',
              }}
            />
            <Link
                className="pb-px border-b border-primary/30 text-primary/50"
                to={`/policies/${shippingPolicy.handle}`}
              >
                Learn more
            </Link>
          </div>
        )} */}

        {/* return部分 - 这是第4个锚点
        {!!refundPolicy?.body && (
          <div id="return" className="pb-8 md:pb-12">
            <h2 className="text-2xl font-semibold">Return Policy</h2>
            <div
              className="prose prose-sm sm:prose dark:prose-invert sm:max-w-4xl mt-7"
              dangerouslySetInnerHTML={{
                __html: getExcerpt(refundPolicy.body) || '',
              }}
            />
            <Link
                className="pb-px border-b border-primary/30 text-primary/50"
                to={`/policies/${refundPolicy.handle}`}
              >
                Learn more
            </Link>
          </div>
        )} */}
      </div>
    </div>
    {!!product.related_collections?.references?.nodes && (
      <CollectionSlider
        heading_bold="Discover more."
        heading_light=""
        sub_heading=""
        collections={product.related_collections?.references?.nodes}
        button_text="See Collection"
        isSkeleton={false}
      />
    )}
    <Analytics.ProductView
      data={{
        products: [
          {
            id: product.id,
            title: product.title,
            price: selectedVariant?.price.amount || '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id || '',
            variantTitle: selectedVariant?.title || '',
            quantity: 1,
          },
        ],
      }}
    />
  </>);
}

export function ProductForm({
  productOptions,
  selectedVariant,
  storeDomain,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center mb-1 gap-4 lg:gap-5">
          <Prices
            contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
            price={selectedVariant?.price!}
            compareAtPrice={selectedVariant?.compareAtPrice!}
          />
        </div>

        {productOptions.map((option, optionIndex) => (
          <div
            key={option.name}
            className="product-options flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {option.optionValues.length > 30 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({open}) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex items-center justify-between w-full py-3 px-4 border border-primary',
                            open
                              ? 'rounded-b md:rounded-t md:rounded-b-none'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {
                              selectedVariant?.selectedOptions[optionIndex]
                                .value
                            }
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.optionValues
                            .filter((value) => value.available)
                            .map(
                              ({
                                isDifferentProduct,
                                name,
                                variantUriQuery,
                                handle,
                                selected,
                              }) => (
                                <Listbox.Option
                                  key={`option-${option.name}-${name}`}
                                  value={name}
                                >
                                  <Link
                                    {...(!isDifferentProduct
                                      ? {rel: 'nofollow'}
                                      : {})}
                                    to={`/products/${handle}?${variantUriQuery}`}
                                    preventScrollReset
                                    className={clsx(
                                      'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                      selected && 'bg-primary/10',
                                    )}
                                    onClick={() => {
                                      if (!closeRef?.current) return;
                                      closeRef.current.click();
                                    }}
                                  >
                                    {name}
                                    {selected && (
                                      <span className="ml-2">
                                        <IconCheck />
                                      </span>
                                    )}
                                  </Link>
                                </Listbox.Option>
                              ),
                            )}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                option.optionValues.map(
                  ({
                    isDifferentProduct,
                    name,
                    variantUriQuery,
                    handle,
                    selected,
                    available,
                    swatch,
                  }) => (
                    <Link
                      key={option.name + name}
                      {...(!isDifferentProduct ? {rel: 'nofollow'} : {})}
                      to={`/products/${handle}?${variantUriQuery}`}
                      preventScrollReset
                      prefetch="intent"
                      replace
                      className={clsx(
                        'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                        selected ? 'border-primary/50' : 'border-primary/0',
                        available ? 'opacity-100' : 'opacity-50',
                      )}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  ),
                )
              )}
            </div>
          </div>
        ))}
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Get Custom Quote</Text>
              </Button>
            ) : (
              <div className="flex gap-2 sm:gap-3.5 items-stretch">
                <div className="flex items-center justify-center bg-blue-100 dark:blue-100 p-2 sm:p-3 rounded-full">
              <NcInputNumber
                className=""
                defaultValue={quantity}
                onChange={setQuantity}
              />
              </div>
              <div className="flex-1 *:h-full *:flex">
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id!,
                    quantity,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
              >
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span>
                </Text>
              </AddToCartButton>
              </div>
            </div>
            )}
            {/* 
            {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id!]}
                storeDomain={storeDomain}
              />
            )}
            */}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="w-8 h-8"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({ open }) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  ${OKENDO_PRODUCT_STAR_RATING_FRAGMENT}
  ${OKENDO_PRODUCT_REVIEWS_FRAGMENT}
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    collections(first: 1) {
        nodes {
          id
          title
          handle
      }
    }
    navigation_cards: metafield(namespace: "custom", key:"navigation_cards") {
      id
      value
      namespace
      key
    }
    dimension_limitation: metafield(namespace: "custom", key:"dimension_limitation") {
      id
      value
      namespace
      key
    }
    specifications: metafield(namespace: "custom", key:"specifications") {
      id
      value
      namespace
      key
    }
    applications: metafield(namespace: "custom", key:"applications") {
      id
      value
      namespace
      key
    }
    features: metafield(namespace: "custom", key:"features") {
      id
      value
      namespace
      key
    }
    customizable_size: metafield(namespace: "custom", key:"customizable_size") {
      id
      value
      namespace
      key
    }
    form_type: metafield(namespace: "custom", key:"form_type") {
      id
      value
      namespace
      key
    }
    material: metafield(namespace: "custom", key:"material") {
      id
      value
      namespace
      key
    }
    opacity: metafield(namespace: "custom", key:"opacity") {
      id
      value
      namespace
      key
    }
    color: metafield(namespace: "custom", key:"color") {
      id
      value
      namespace
      key
    }
    thickness: metafield(namespace: "custom", key:"thickness") {
      id
      value
      namespace
      key
    }
    diameter: metafield(namespace: "custom", key:"diameter") {
      id
      value
      namespace
      key
    }
    machining_precision: metafield(namespace: "custom", key:"machining_precision") {
      id
      value
      namespace
      key
    }
    density: metafield(namespace: "custom", key:"density") {
      id
      value
      namespace
      key
    }
    unit_price: metafield(namespace: "custom", key:"unit_price") {
      id
      value
      namespace
      key
    }
    related_collections: metafield(namespace: "custom", key: "related_collections") {
      references(first: 10) {
        nodes {
          ... on Collection {
            ...CommonCollectionItem
          }
        }
      }
    }  
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    media(first: 7) {
      nodes {
        ...Media
      }
    }
    ...OkendoStarRatingSnippet
    ...OkendoReviewsSnippet
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  ${COMMON_COLLECTION_ITEM_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export const Collection_Handle_QUERY = `#graphql
  query collectionHandle(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language){
    product(handle: $handle) {
      collections(first: 1) {
        nodes {
          handle
          products(first: 1) {
            filters {
              label
              values {
                label
              }
            }
          }
        }
        edges {
          node {
            products(first: 250) {
              nodes {
                metafields(identifiers: [{key: "material", namespace: "custom"},{key: "color", namespace: "custom"},{key: "thickness", namespace: "custom"},{key: "diameter", namespace: "custom"}]) {
                  key
                  value
                }
                handle
              }
            }
          }
      }
      }
    }
  }
` as const;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: { productId, count: 12 },
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return { nodes: products.recommended ?? []  };
}
