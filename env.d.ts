/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type {
  WithCache,
  HydrogenCart,
  HydrogenSessionData,
} from '@shopify/hydrogen';
import type {Storefront, CustomerAccount} from '~/lib/type';
import type {AppSession} from '~/lib/session.server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    //OKENDO
    PUBLIC_OKENDO_SUBSCRIBER_ID: string;
    // ...other environment variables
    SANITY_PROJECT_ID: string;
    SANITY_DATASET?: string;
    SANITY_API_VERSION?: string;
    SANITY_API_TOKEN: string;
    //我把SHOPIFY_ADMIN_ACCESS_TOKEN放在这里了
    SHOPIFY_ADMIN_ACCESS_TOKEN: string;
    SHOPIFY_ADMIN_API_VERSION: string;
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    SHOP_ID: string;
  }
}

declare module 'react-router' {
  
    // TODO: remove this once we've migrated to `Route.LoaderArgs` for our loaders
    interface LoaderFunctionArgs {
      context: AppLoadContext;
    }
  
    // TODO: remove this once we've migrated to `Route.ActionArgs` for our actions
    interface ActionFunctionArgs {
      context: AppLoadContext;
    }
  /**
   * Declare local additions to the Remix loader context.
   */
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: AppSession;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    cart: HydrogenCart;
    env: Env;
  }

  /**
   * Declare local additions to the Remix session data.
   */
  interface SessionData extends HydrogenSessionData {}
}

// Needed to make this file a module.
export {};
