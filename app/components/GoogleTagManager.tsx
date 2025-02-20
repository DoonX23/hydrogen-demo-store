import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function GoogleTagManager() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Google Tag Manager');

  useEffect(() => {
    // Standard events
    subscribe('page_viewed', (data) => {
      window.dataLayer.push({
        'event': 'page-viewed',
        'ecommerceData': {...data}
      });
    });
    subscribe('product_viewed', (data) => {
      window.dataLayer.push({
        'event': 'product-viewed',
        'ecommerceData': {...data}
      });
    });
    subscribe('collection_viewed', (data) => {
      window.dataLayer.push({
        'event': 'collection-viewed',
        'ecommerceData': {...data}
      });
    });
    subscribe('cart_viewed', (data) => {
      window.dataLayer.push({
        'event': 'cart-viewed',
        'ecommerceData': {...data}
      });
    });
    subscribe('cart_updated', (data) => {
      window.dataLayer.push({
        'event': 'cart-updated',
        'ecommerceData': {...data}
      });
    });

    ready();
  }, []);

  return null;
}