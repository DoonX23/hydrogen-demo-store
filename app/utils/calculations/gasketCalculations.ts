// ~/lib/calculations/gasketCalculations.ts
import { 
  calculateShipping, 
  calculateOversizeFee,
  calculateMachiningBaseFee,
  type CalculationResult 
} from './common';

export interface GasketCalculationProps {
  thickness: string;
  density: number;
  innerDiameterMm: number;
  outerDiameterMm: number;
  quantity: number;
  unitPrice: number;
}

export function calculateGasketPriceAndWeight(props: GasketCalculationProps): CalculationResult {
  const { thickness, density, innerDiameterMm, outerDiameterMm, quantity, unitPrice } = props;
  
  // 1. 计算垫片实际重量（用于运费计算）
  // 计算外半径（毫米）
  const outerRadius = outerDiameterMm / 2;
  // 计算内半径（毫米）
  const innerRadius = innerDiameterMm / 2;
  // 计算环形面积（平方毫米），公式: A = π * (R² - r²)
  const areaMm2 = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2));
  // 将厚度字符串转换为数字
  const thicknessNum = parseFloat(thickness);
  // 计算体积（立方毫米）= 面积 × 厚度
  const volumeMm3 = areaMm2 * thicknessNum;
  // 计算重量（千克）= 体积 × 密度 / 1000000（转换为kg）
  let weight = (volumeMm3 * density) / 1000000;
  // 设置最小重量为0.001kg
  weight = Math.max(0.001, weight);
  
  // 2. 计算材料成本
  // 计算板材面积（平方毫米）= 外径的平方
  const sheetAreaMm2 = Math.pow(outerDiameterMm, 2);
  // 计算板材体积（立方毫米）= 板材面积 × 厚度
  const sheetVolumeMm3 = sheetAreaMm2 * thicknessNum;
  // 计算板材重量（千克）= 板材体积 × 密度 / 1000000
  const sheetWeight = (sheetVolumeMm3 * density) / 1000000;
  // 材料成本 = 板材重量 × 单价
  const materialCost = sheetWeight * unitPrice;
  
  // 3. 加工费
  // 在0.2美元和材料成本的50%中取最大值
  const machiningFee = Math.max(0.2, materialCost * 0.5);
  
  // 4. 超大尺寸附加费
  // 按外径判断是否超尺寸
  const oversizeFee = calculateOversizeFee(outerDiameterMm, quantity);

  // 5. 加工起始费
  const machiningBaseFee = calculateMachiningBaseFee(quantity);
  
  // 6. 运费
  // 运费基于实际重量计算
  const shippingFee = calculateShipping(weight,quantity);
  
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