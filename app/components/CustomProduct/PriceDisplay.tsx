import { useEffect, useState } from 'react';
import {
  calculatePriceAndWeight, 
  type CalculationProps, 
} from '~/utils/calculations';

/**
 * PriceDisplay组件 - 用于显示产品的价格和优惠码
 */
export function PriceDisplay(props: CalculationProps) {
  const { quantity } = props;
  const [isCopied, setIsCopied] = useState(false);
  
  // 计算当前价格和重量
  const result = calculatePriceAndWeight(props);
  const totalPrice = Number(result.price) * quantity;
  const formattedPrice = totalPrice.toFixed(2);
  
  // 定义优惠码门槛和相应折扣
  const discountTiers = [
    { 
      code: "DOONX10", 
      description: "10% off on orders over $199", 
      discountPercent: "10%",
      minPrice: 199 
    },
    { 
      code: "DOONX5", 
      description: "5% off on orders over $99", 
      discountPercent: "5%",
      minPrice: 99 
    }
  ];
  
  // 查找最大适用折扣（如果有）
  const applicableDiscount = discountTiers.find(
    discount => totalPrice >= discount.minPrice
  );

  // 处理复制优惠码的逻辑
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      
      // 2秒后重置复制状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="mb-4 space-y-4">
      <div className="text-xl font-medium text-primary">
        Price:
        <span className="text-brand dark:text-highlight"> ${formattedPrice}</span>
      </div>
      
      <div className="mt-4 p-3 border border-blue-100 rounded bg-blue-100 text-highlight">
        {applicableDiscount ? (
          <div className="flex items-center">
            {/* 第一列：折扣数值 - 正方形区域 */}
            <div className="flex-none w-12 h-12 flex items-center justify-center rounded-lg hidden md:flex mx-2">
              <span className="text-3xl font-bold text-center">{applicableDiscount.discountPercent}</span>
            </div>
            
            {/* 第二列：优惠码和描述 */}
            <div className="flex-grow ml-0 md:ml-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-brand uppercase tracking-wide mr-2">Code:</span>
                <span className="text-sm text-brand font-medium">{applicableDiscount.code}</span>
              </div>
              <p className="text-xs text-brand ">{applicableDiscount.description}</p>
            </div>
            
            {/* 第三列：复制按钮 */}
            <div className="flex-none">
              <button 
                onClick={() => handleCopyCode(applicableDiscount.code)}
                className="flex items-center px-3 py-1.5 text-sm font-semibold border border-highlight rounded-full hover:bg-highlight hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {isCopied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-highlight">
            <p className="text-l font-semibold">Buy more to unlock discounts! </p>
            <p className="mt-1 text-xs">Orders over $99 qualify for special offers.</p>
          </div>
        )}
      </div>
    </div>
  );
}