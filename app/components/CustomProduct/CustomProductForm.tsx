// ~/components/CustomProduct/CustomProductForm.tsx
import type {ProductQuery} from 'storefrontapi.generated';
import {useState} from 'react';
import {useFetcher} from 'react-router';
import {SheetForm} from './SheetForm';
import {FilmForm} from './FilmForm';
import {RodForm} from './RodForm';
import {FlexibleRodForm} from './FlexibleRodForm';
import {GasketForm} from './GasketForm';  // 导入新组件
import {DiscForm} from './DiscForm';  // 新增导入
import {Button} from '~/components/Button';
import type {MetafieldNavigatorProps} from './ProductMetafieldNavigator';
import NavigationCardGrid, {type NavigationCard} from './NavigationCardGrid'; // 导入类型

interface ApiResponse {
  status: 'success' | 'error';
  error?: string;
  variantCreation?: any;
  cartOperation?: any;
  timestamp?: string;
}

// 定义导航卡片数据结构类型 - 使用从 NavigationCardGrid 导出的类型
interface NavigationCardsData {
  cards?: NavigationCard[]; // 直接使用 NavigationCard 类型
}

interface CustomProductFormProps {
  product: ProductQuery['product'];
  facets: MetafieldNavigatorProps['options'];
  productMetafields: MetafieldNavigatorProps['variants'];
}

export function CustomProductForm({product, facets, productMetafields}: CustomProductFormProps) {
  if (!product?.id) {
    throw new Response('product', {status: 404});
  }
  
  const fetcher = useFetcher<ApiResponse>();
  const formType = product.form_type?.value || '';
  
  // 只提升hasError状态到父组件
  const [hasError, setHasError] = useState(false);

   // 简便方法：直接解析并提取 cards 数组
   const navigationCards: NavigationCard[] = (() => {
    try {
      // 如果 navigation_cards 不存在，返回空数组
      if (!product.navigation_cards?.value) return [];
      
      // 解析 JSON 字符串
      const parsed = JSON.parse(product.navigation_cards.value) as NavigationCardsData;
      
      // 提取 cards 数组并添加 isActive 属性
      return (parsed.cards || []).map((card: NavigationCard) => ({
        ...card,
        isActive: card.formType === formType,
      }));
    } catch (error) {
      // 如果解析失败，打印错误并返回空数组
      console.error('Failed to parse navigation_cards:', error);
      return [];
    }
  })();
  // 根据formType渲染对应的表单组件
  const renderForm = () => {
    const commonProps = {
      product,
      facets,
      productMetafields,
      onError: setHasError,
    };

    switch(formType) {
      case 'Sheet':
        return <SheetForm {...commonProps} />;
      case 'Film':
        return <FilmForm {...commonProps} />;
      case 'Rod':
        return <RodForm {...commonProps} />;
      case 'Flexible Rod':
        return <FlexibleRodForm {...commonProps} />;
      case 'Gasket':  // 新增case
      return <GasketForm {...commonProps} />;
      case 'Disc':  // 新增case
      return <DiscForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* 只在有导航卡片数据时渲染导航卡片网格 */}
      {navigationCards.length > 0 && (
        <NavigationCardGrid cards={navigationCards} />
      )}
      <fetcher.Form action="/api/custom-add-to-cart" method="post">
        {/* 公共隐藏字段 */}
        <input type="hidden" name="productId" value={product.id || ''} />
        <input type="hidden" name="formType" value={formType} />
        <input type="hidden" name="material" value={product.material?.value || ''} />
        <input type="hidden" name="opacity" value={product.opacity?.value || ''} />
        <input type="hidden" name="color" value={product.color?.value || ''} />
        
        {/* 渲染对应的表单组件 */}
        {renderForm()}
        
        {/* 公共提交按钮 */}
        <div className="grid items-stretch gap-4">
          <Button
            type="submit"
            disabled={fetcher.state !== 'idle' || hasError}
          >
            <span>
              {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
            </span>
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}