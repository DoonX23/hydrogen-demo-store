import React from 'react';
import { Link } from '~/components/Link';

// 定义面包屑项的类型
interface BreadcrumbItem {
  _key: string;
  title: string;
  path: string;
}

// 定义组件的属性
interface BreadcrumbProps {
  breadcrumb: BreadcrumbItem[];
}

// Breadcrumb 组件
const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumb }) => {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs py-4 px-4 md:px-6">
      <ol className="flex flex-wrap items-center text-sm text-gray-500">
        {/* 首页链接 */}
        <li className="flex items-center">
          <Link to="/" className="hover:text-gray-700 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
        </li>
        
        {/* 面包屑项目 */}
        {breadcrumb.map((item, index) => (
          <li key={item._key} className="flex items-center">
            {index < breadcrumb.length - 1 ? (
              <>
                <Link 
                  to={`/${item.path}`} 
                  className="hover:text-gray-700 hover:underline"
                >
                  {item.title}
                </Link>
                <span className="mx-2">/</span>
              </>
            ) : (
              // 最后一项（当前页面）不可点击
              <span className="font-medium text-gray-900">{item.title}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;