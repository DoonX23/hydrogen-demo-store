import {
  type PageViewPayload,
  type ProductViewPayload,
  type CollectionViewPayload,
  type CartViewPayload,
  type CartUpdatePayload,
  type CartLineUpdatePayload,
  type SearchViewPayload,
  useAnalytics,
} from '@shopify/hydrogen';
import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Helper function to extract numeric ID from Shopify GID
const extractShopifyId = (gid: string): string => {
  if (!gid) return '';
  const matches = gid.match(/\/Product\/(\d+)/);
  return matches ? matches[1] : gid;
};


export function GoogleTagManager() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Google Tag Manager');

  useEffect(() => {
    // Standard events
    subscribe('page_viewed', (data: PageViewPayload) => {
      console.log('page_viewed:', JSON.stringify(data, null, 2));
      window.dataLayer.push({
        'event': 'page-viewed',
        //'ecommerce': {...data}
      });
    });
    
    subscribe('product_viewed', (data: ProductViewPayload) => {
      console.log('view_item:', JSON.stringify(data, null, 2));
      
      // 转换数据格式
      const items = data.products.map((product, index) => ({
        item_id: extractShopifyId(product.id),
        item_name: product.title,
        index: index,
        item_brand: product.vendor,
      }));
    
      const ecommerceData = {
        currency: data.shop?.currency,
        items: items,
      };
      
      window.dataLayer.push({
        'event': 'view_item',
        'ecommerce': ecommerceData
      });
    });
    
    subscribe('collection_viewed', (data:CollectionViewPayload) => {
      console.log('collection_viewed:', JSON.stringify(data, null, 2));

      const ecommerceData = {
        item_list_id: data.collection.id,
        item_list_name: data.collection.handle,
        items: undefined,
      };

      window.dataLayer.push({
        'event': 'view_item_list',
        'ecommerce': ecommerceData
      });
    });

    subscribe('search_viewed', (data:SearchViewPayload) => {
      console.log('search_viewed:', JSON.stringify(data, null, 2));

      const ecommerceData = {
        search_term: data.searchTerm,
      };

      window.dataLayer.push({
        'event': 'search',
        'ecommerce': ecommerceData
      });
    });

    /*If your cart is a side panel, you can publish the cart_viewed event with useAnalytics.
    publish('cart_viewed', {
              cart,
              prevCart,
              shop,
              url: window.location.href || '',
            } as CartViewPayload);
    要在cart侧边栏发布了，才能订阅cart_viewed事件，未来再添加。cart页面目前倒是可以使用的。之所以关闭，是因为现在根本没有cart页面入口。

    subscribe('cart_viewed', (data:CartViewPayload) => {
      console.log('cart_viewed:', JSON.stringify(data, null, 2));
      window.dataLayer.push({
        'event': 'cart-viewed',
        'ecommerce': {...data}
      });
    });*/
       
    subscribe('product_added_to_cart', (data:CartLineUpdatePayload) => {
      console.log('product_added_to_cart:', JSON.stringify(data, null, 2));
      // 确保 currentLine 存在
      if (!data.currentLine) {
        return;
      }
    
      const items = [{
        item_id: extractShopifyId(data.currentLine.merchandise.product.id) ?? '',
        item_name: data.currentLine.merchandise.product.title ?? '',
        item_brand: data.currentLine.merchandise.product.vendor ?? '',
        item_variant: data.currentLine.merchandise.title ?? '',
        price: Number(data.currentLine.merchandise.price?.amount ?? '0'),
        quantity: data.currentLine.quantity ?? 0,
        index: 0,
      }];
    
      const ecommerceData = {
        currency: data.shop?.currency ?? 'USD',
        value: Number(data.currentLine.cost.totalAmount.amount ?? '0'),
        items: items
      };
    
      window.dataLayer.push({
        'event': 'add_to_cart',
        'ecommerce': ecommerceData
      });
    });

    subscribe('product_removed_from_cart', (data: CartLineUpdatePayload) => {
      console.log('product_removed_from_cart:', JSON.stringify(data, null, 2));
    
      // 确保 prevLine 存在
      if (!data.prevLine) {
        return;
      }
    
      const items = [{
        item_id: extractShopifyId(data.prevLine.merchandise.product.id) ?? '',
        item_name: data.prevLine.merchandise.product.title ?? '',
        item_brand: data.prevLine.merchandise.product.vendor ?? '',
        item_variant: data.prevLine.merchandise.title ?? '',
        price: Number(data.prevLine.merchandise.price?.amount ?? '0'),
        quantity: data.prevLine.quantity ?? 0,
        index: 0,
      }];
    
      const ecommerceData = {
        currency: data.shop?.currency ?? 'USD', // 提供默认值
        value: Number(data.prevLine.cost.totalAmount.amount ?? '0'),
        items: items
      };
    
      window.dataLayer.push({
        'event': 'remove_from_cart',
        'ecommerce': ecommerceData
      });
    });

    ready();
  }, []);

  return null;
}