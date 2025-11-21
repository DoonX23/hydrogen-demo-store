// ~/lib/calculations/discCalculations.ts
import { 
  calculateShipping, 
  calculateOversizeFee,
  calculateMachiningBaseFee,  // 新增导入
  type CalculationResult 
} from './common';

export interface DiscCalculationProps {
  thickness: string;
  density: number;
  diameterMm: number;
  quantity: number;
  unitPrice: number;
  // 移除 precision: string;
}

export function calculateDiscPriceAndWeight(props: DiscCalculationProps): CalculationResult {
  const { thickness, density, diameterMm, quantity, unitPrice } = props;
  
  // 1. 计算圆形面积
  // 公式: A = π * r²
  const radius = diameterMm / 2;
  const areaMm2 = Math.PI * Math.pow(radius, 2);
  
  // 2. 计算体积和重量
  const thicknessNum = parseFloat(thickness);
  const volumeMm3 = areaMm2 * thicknessNum;
  let weight = (volumeMm3 * density) / 1000000; // 转换为kg
  weight = Math.max(0.001, weight); // 最小重量0.001kg
  
  // 3. 基础价格
  const basePrice = weight * unitPrice;
  
  // 4. 超大尺寸附加费
  const oversizeFee = calculateOversizeFee(diameterMm, quantity);
  
  // 5. 运费
  const shippingFee = calculateShipping(weight);

  // 加工起始费（新增）
  const machiningBaseFee = calculateMachiningBaseFee(quantity);
  
  // 6. 总价（移除精度费用）
  const finalPrice = Math.max(0.01, basePrice + shippingFee + oversizeFee + machiningBaseFee );
  
  return {
    price: finalPrice.toFixed(2),
    weight: Number(weight.toFixed(3))
  };
}