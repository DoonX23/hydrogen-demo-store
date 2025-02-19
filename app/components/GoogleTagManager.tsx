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
      console.log('ThirdPartyAnalyticsIntegration - Page viewed:', data);
    });
    subscribe('product_viewed', (data) => {
      console.log('ThirdPartyAnalyticsIntegration - Product viewed:', data);
      // Triggering a custom event in GTM when a product is viewed
      window.dataLayer.push({'event': 'viewed-product'});
    });
    subscribe('collection_viewed', (data) => {
      console.log('ThirdPartyAnalyticsIntegration - Collection viewed:', data);
    });
    subscribe('cart_viewed', (data) => {
      console.log('ThirdPartyAnalyticsIntegration - Cart viewed:', data);
    });
    subscribe('cart_updated', (data) => {
      console.log('ThirdPartyAnalyticsIntegration - Cart updated:', data);
    });

    // Custom events
    subscribe('custom_checkbox_toggled', (data) => {
      console.log('ThirdPartyAnalyticsIntegration - Custom checkbox toggled:', data);
    });
    ready();
  }, []);

  return null;
}