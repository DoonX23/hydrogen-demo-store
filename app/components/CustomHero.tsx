import {ChevronRightIcon} from '@heroicons/react/20/solid';
import type {
  MediaImage,
  Media,
  Video as MediaVideo,
} from '@shopify/hydrogen/storefront-api-types';
import type {CollectionContentFragment} from 'storefrontapi.generated';
import {MediaFile} from '@shopify/hydrogen';

type CustomHeroProps = CollectionContentFragment & {
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
};

export default function CustomHero({
  byline,
  cta,
  handle,
  heading,
  height,
  loading,
  spread,
  spreadSecondary,
  top,
}: CustomHeroProps) {
  return (
    <div className="relative bg-white">
      <div className="mx-auto container py-8 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:px-4">
      <div className="relative lg:col-span-1">
          {spread?.reference && (
            <SpreadMedia
              sizes="100vw"
              data={spread.reference as Media}
              loading={loading}
            />
          )}
        </div>
        <div className="px-6 lg:col-span-1 lg:px-0 flex items-center">
          <div className="mx-auto max-w-2xl lg:mx-0">
            {cta?.value && (
              <div className="flex">
                <div className="relative flex items-center gap-x-4 rounded-full bg-white px-4 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  <span className="font-semibold text-indigo-600">{cta.value}</span>
                  <span aria-hidden="true" className="h-4 w-px bg-gray-900/10" />
                  <a href={`/collections/${handle}`} className="flex items-center gap-x-1">
                    <span aria-hidden="true" className="absolute inset-0" />
                    See more
                    <ChevronRightIcon aria-hidden="true" className="-mr-2 size-5 text-gray-400" />
                  </a>
                </div>
              </div>
            )}

            {heading?.value && (
              <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {heading.value}
              </h1>
            )}

            {byline?.value && (
              <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                {byline.value}
              </p>
            )}
            {/* 添加按钮组 */}
            <div className="mt-10 flex items-center gap-x-6">
            <a
                href={`/collections/${handle}`}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                {cta?.value || 'Get started'}
            </a>
            <a href={`/collections/${handle}`} className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
            </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SpreadMediaProps = {
  data: Media | MediaImage | MediaVideo;
  loading?: HTMLImageElement['loading'];
  sizes: string;
};

function SpreadMedia({data, loading, sizes}: SpreadMediaProps) {
  return (
    <MediaFile
      data={data}
      className="aspect-[5/4] w-full"
      mediaOptions={{
        video: {
          controls: false,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          previewImageOptions: {src: data.previewImage?.url ?? ''},
        },
        image: {
          loading,
          crop: 'center',
          sizes,
          alt: data.alt || '',
        },
      }}
    />
  );
}