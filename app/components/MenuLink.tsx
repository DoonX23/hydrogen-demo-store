// components/MenuLink.tsx
import {Link} from '@remix-run/react';
import type {
  ChildEnhancedMenuItem,
  GrandChildEnhancedMenuItem,
  ParentEnhancedMenuItem,
} from '~/lib/utils';

export function MenuLink({
  item, 
  onClose,
  className
}: {
  item: ChildEnhancedMenuItem | GrandChildEnhancedMenuItem | ParentEnhancedMenuItem;
  onClose?: () => void;
  className?: string;
}) {
  if (item.to.startsWith('http')) {
    return (
      <a 
        href={item.to} 
        target={item.target} 
        rel="noopener noreferrer"
        className={className}
      >
        {item.title}
      </a>
    );
  }

    // 处理内部链接
    let path = item.to;
    if (item.url) {
      // 移除域名部分，只保留路径
      const url = new URL(item.url);
      path = url.pathname; // 这会保留完整的路径，如 /materials/Url1/Url2
    }

  return (
    <Link 
      to={path} 
      target={item.target} 
      onClick={onClose} 
      prefetch="intent"
      className={className}
    >
      {item.title}
    </Link>
  );
}