import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
  ],
  // ↓↓↓ 强制某些包被视为 ES 模块
  ssr: {
    optimizeDeps: {
      include: [
        'typographic-base',
        '@sanity/client',
        'hydrogen-sanity',
        // ↓↓↓ 强制包含 rxjs 的 ESM 版本
        'rxjs',
        'rxjs/operators',
      ],
    },
    noExternal: [
      'hydrogen-sanity',
      '@sanity/client',
      'rxjs',
      // ↓↓↓ 添加所有 rxjs 相关包
      /^rxjs/,
    ],
  },
  // ↓↓↓ 添加这个配置来解决模块兼容性问题
  optimizeDeps: {
    include: [
      'clsx',
      '@headlessui/react',
      'typographic-base',
      'react-intersection-observer',
      'react-use/esm/useScroll',
      'react-use/esm/useDebounce',
      'react-use/esm/useWindowScroll',
      '@sanity/client',
      'hydrogen-sanity',
      'rxjs',
    ],
    // ↓↓↓ 强制排除有问题的 CommonJS 包
    exclude: [
      'rxjs/dist/cjs',
    ],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
});
