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
}

export function calculateDiscPriceAndWeight(props: DiscCalculationProps): CalculationResult {
  const { thickness, density, diameterMm, quantity, unitPrice } = props;
  
  // 1. 计算圆盘实际重量（用于运费计算）
  const radius = diameterMm / 2;
  const areaMm2 = Math.PI * Math.pow(radius, 2);
  const thicknessNum = parseFloat(thickness);
  const volumeMm3 = areaMm2 * thicknessNum;
  let weight = (volumeMm3 * density) / 1000000;
  weight = Math.max(0.001, weight);
  
  // 2. 计算材料成本
  const sheetAreaMm2 = Math.pow(diameterMm, 2);
  const sheetVolumeMm3 = sheetAreaMm2 * thicknessNum;
  const sheetWeight = (sheetVolumeMm3 * density) / 1000000;
  const materialCost = sheetWeight * unitPrice;
  
  // 3. 加工费
  // 在0.1美元和材料成本的30%中取最大值
  const machiningFee = Math.max(0.1, materialCost * 0.3);
  
  // 4. 超大尺寸附加费
  const oversizeFee = calculateOversizeFee(diameterMm, quantity);
  
  // 5. 加工起始费
  const machiningBaseFee = calculateMachiningBaseFee(quantity);

  // 6. 运费
  const shippingFee = calculateShipping(weight);
  
  // 7. 总价 = 材料成本 + 运费 + 超大尺寸附加运费 + 加工起始费 + 加工费
  const finalPrice = Math.max(0.01, materialCost + shippingFee + oversizeFee + machiningBaseFee + machiningFee);
  
  // 返回结果对象
  return {
    // 价格保留两位小数并转换为字符串
    price: finalPrice.toFixed(2),
    // 重量保留三位小数
    weight: Number(weight.toFixed(3))
  };
}