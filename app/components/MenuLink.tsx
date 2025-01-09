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
  return (
    <Link 
      to={item.to} 
      target={item.target} 
      onClick={onClose} 
      prefetch="intent"
      className={className}
    >
      {item.title}
    </Link>
  );
}