import { RichText } from '@shopify/hydrogen';
import type { ProductQuery } from 'storefrontapi.generated';
import {ExternalVideo} from '@shopify/hydrogen';
import type {DimensionLimitation} from '~/lib/type';
// ProductDescriptionSection组件定义
export function ProductDescriptionSection({ product }: { product: ProductQuery['product']; }) {
    if (!product) return null;
    // 从product解析需要的属性
    const { descriptionHtml } = product;
    const dimensionLimitation = product.dimension_limitation?.value
    ? JSON.parse(product.dimension_limitation.value) as DimensionLimitation
    : {};

    // 定义产品属性列表（原组件中的productAttributes）
    const productAttributes = [
        { name: "Form Type", value: product.form_type?.value },
        { name: "Stock Sizes", value: dimensionLimitation.stockSizes },
        { name: "Material", value: product.material?.value },
        { name: "Opacity", value: product.opacity?.value },
        { name: "Color", value: product.color?.value },
        { name: "Thickness", value: product.thickness?.value },
        { name: "Diameter", value: product.diameter?.value },
        { name: "Machining Precision", value: product.machining_precision?.value },
        { name: "Density", value: product.density?.value }
    ];

    // 过滤空值属性（原组件中的filteredAttributes）
    const filteredAttributes = productAttributes.filter(attr => attr.value);

      // 筛选出所有 ExternalVideo 类型的媒体
  const externalVideos = product.media.nodes.filter(
    mediaItem => mediaItem.__typename === 'ExternalVideo'
  );

  // 正确的YouTube选项格式 - 使用明确的字面量类型
  const youtubeOptions = {
    autoplay: 0 as 0,        
    controls: 1 as 1,        
    modest_branding: 1 as 1, 
    rel: 0 as 0,             
    fs: 1 as 1,              
    color: 'white' as 'white',
    plays_inline: 1 as 1,    
  };


    return (
        <div id="description" className="py-8 md:py-12">
            <h2 className="text-2xl font-semibold">Product Details</h2>
            <div className="flex flex-col md:flex-row">
                {/* 产品属性区块 */}
                <div className="pb-8 w-full md:w-1/2">
                    <div className="mt-6 border-t border-gray-100">
                        <dl className="divide-y divide-gray-100">
                            {filteredAttributes.map((attr, index) => (
                                <div
                                    key={attr.name}
                                    className={`${index % 2 === 0 ? 'bg-blue-100' : 'bg-white'} px-4 py-2 grid grid-cols-2 gap-4 sm:px-3`}
                                >
                                    <dt className="text-sm/6 font-medium text-gray-900">{attr.name}</dt>
                                    <dd className="text-sm/6 text-gray-700">{attr.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
            {/* 展示所有外部视频 */}
            {externalVideos.length > 0 && (
                    <div className="pb-8 md:pb-12">
                        <h3 className="font-bold pb-4">Product Videos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {externalVideos.map((video) => (
                            <div key={video.id} className="video-wrapper rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <ExternalVideo 
                                data={video} 
                                className="w-full h-auto aspect-video"
                                options={youtubeOptions}
                            />
                            </div>
                        ))}
                        </div>
                    </div>
                )}

            {/* 产品描述 */}
            {!!descriptionHtml && (
                <div
                    className="prose prose-sm sm:prose dark:prose-invert sm:max-w-4xl my-7"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml || '' }}
                />
            )}

            {/* 特性应用区块 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 特色部分 */}
                {product.features?.value && (
                    <div className="bg-gray-50 dark:bg-contrast/60 pb-3 rounded">
                        <h3 className="font-bold pb-4">Features</h3>
                        <RichText
                            data={product.features.value}
                            components={{
                                root: ({ node }) => <div className="custom-root">{node.children}</div>,
                                list: ({ node }) =>
                                    node.listType === "unordered"
                                        ? <ul className="custom-list">{node.children}</ul>
                                        : <ol className="custom-list">{node.children}</ol>,
                                listItem: ({ node }) => <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand dark:before:bg-gray-50">{node.children}</li>
                            }}
                        />
                    </div>
                )}

                {/* 应用部分 */}
                {product.applications?.value && (
                    <div className="bg-gray-50 dark:bg-contrast/60 pb-3 rounded">
                        <h3 className="font-bold pb-4">Applications</h3>
                        <RichText
                            data={product.applications.value}
                            components={{
                                root: ({ node }) => <div className="custom-root">{node.children}</div>,
                                list: ({ node }) =>
                                    node.listType === "unordered"
                                        ? <ul className="custom-list">{node.children}</ul>
                                        : <ol className="custom-list">{node.children}</ol>,
                                listItem: ({ node }) => <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand dark:before:bg-gray-50">{node.children}</li>
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}