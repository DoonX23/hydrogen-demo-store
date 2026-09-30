// ~/components/CustomProduct/CustomProductForm.tsx
import type {ProductQuery} from 'storefrontapi.generated';
import {useState, useMemo} from 'react';
// import {useFetcher} from 'react-router'; // 这一行被你下面的 hooks 替代了，可以保持原样
import {resolveProductConfig} from '~/lib/customProductConfig';
import {SheetForm} from './SheetForm';
import {FilmForm} from './FilmForm';
import {RodForm} from './RodForm';
import {FlexibleRodForm} from './FlexibleRodForm';
import {GasketForm} from './GasketForm';  // 导入新组件
import {DiscForm} from './DiscForm';  // 新增导入
import {Button} from '~/components/Button';
import type {MetafieldNavigatorProps} from './ProductMetafieldNavigator';
import { useAutoOpenCartOnAdd } from '~/hooks/useAutoOpenCartOnAdd';
import type {UnitSystem} from '~/utils/units';

// 1. 引入 Turnstile 组件
import { Turnstile } from '@marsidev/react-turnstile';

interface ApiResponse {
  status: 'success' | 'error';
  error?: string;
  variantCreation?: any;
  cartOperation?: any;
  timestamp?: string;
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
  
  const fetcher = useAutoOpenCartOnAdd();

  // 全站唯一 metafield 解析点在此触发一次：拆包装 + 验货 + 兜底，产出类型化配置
  const config = useMemo(() => resolveProductConfig(product), [product]);
  const formType = config.formType;
  
  // 只提升hasError状态到父组件
  const [hasError, setHasError] = useState(false);

  // 2. 新增状态：存储验证码的 Token
  const [turnstileToken, setTurnstileToken] = useState('');

  // 全局单位制：提升到容器层，六个表单共享；默认英制（业务决策）
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  // 你的 Site Key (建议如果不方便配环境变量，可以直接先填字符串应急)
  // 长期建议写在 .env 只有以 PUBLIC_ 开头的变量才能在前端访问
  // 本地开发用 Cloudflare 官方测试密钥（始终通过，渲染后立即签发 Token，按钮秒解锁）；
  // 生产构建时 import.meta.env.DEV 被 Vite 静态替换为 false，自动回退到正式密钥
  const SITE_KEY = import.meta.env.DEV
    ? '1x00000000000000000000AA' // Cloudflare 官方测试 sitekey：Always passes
    : '0x4AAAAAACQC0b_vm7jHVZbN';

  // 根据formType渲染对应的表单组件
  const renderForm = () => {
    const commonProps = {
      product,
      config,
      facets,
      productMetafields,
      onError: setHasError,
      unitSystem,
      onUnitSystemChange: setUnitSystem,
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
      <fetcher.Form action="/api/custom-add-to-cart" method="post">
        {/* 公共隐藏字段 */}
        <input type="hidden" name="productId" value={product.id || ''} />
        <input type="hidden" name="formType" value={formType} />
        <input type="hidden" name="material" value={product.material?.value || ''} />
        <input type="hidden" name="opacity" value={product.opacity?.value || ''} />
        <input type="hidden" name="color" value={product.color?.value || ''} />
        
        {/* 3. 核心关键：必须把 Token 放入隐藏的 input 发送给后端 */}
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

        {/* 渲染对应的表单组件（单位制切换在各表单尺寸输入区顶部，radio 直接提交 unitSystem） */}
        {renderForm()}
        
        {/* 公共提交按钮 */}
        <div className="grid items-stretch gap-4">
          
          {/* 4. 插入验证码组件 (放在按钮上方) */}
          <div className="flex justify-center my-2">
            <Turnstile
              siteKey={SITE_KEY}
              options={{
                action: 'custom-product-add', // 给 Cloudflare 报表用的标记
                theme: 'light', // 'light' | 'dark' | 'auto'
                size: 'flexible' // 自适应宽度
              }}
              onSuccess={(token) => setTurnstileToken(token)} // 成功：存 Token
              onError={() => setTurnstileToken('')} // 失败：清空
              onExpire={() => setTurnstileToken('')} // 过期：清空
            />
          </div>

          <Button
            type="submit"
            disabled={fetcher.state !== 'idle' || hasError || !turnstileToken}
            className={!turnstileToken ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <span>
              {fetcher.state !== 'idle'
                ? 'Adding...' // 1. 正在提交给后端
                : !turnstileToken
                ? 'Verifying...' // 2. Turnstile 还在加载或验证中
                : 'Add to Cart'  // 3. 验证通过，可以点击
              }
            </span>
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}