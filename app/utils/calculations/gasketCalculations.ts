// ~/lib/calculations/gasketCalculations.ts
import { 
    calculateShipping, 
    calculateOversizeFee,
    calculateMachiningBaseFee,  // 新增导入
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
    
    // 1. 计算环形面积
    // 公式: A = π * (R² - r²)
    const outerRadius = outerDiameterMm / 2;
    const innerRadius = innerDiameterMm / 2;
    const areaMm2 = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2));
    
    // 2. 计算体积和重量
    const thicknessNum = parseFloat(thickness);
    const volumeMm3 = areaMm2 * thicknessNum;
    let weight = (volumeMm3 * density) / 1000000; // 转换为kg
    weight = Math.max(0.001, weight); // 最小重量0.001kg
    
    // 3. 基础价格
    const basePrice = weight * unitPrice;
    
    // 4. 超大尺寸附加费
    // Gasket按外径计算是否超尺寸
    const oversizeFee = calculateOversizeFee(outerDiameterMm, quantity);

    // 加工起始费（新增）
    const machiningBaseFee = calculateMachiningBaseFee(quantity);
    
    // 5. 运费
    const shippingFee = calculateShipping(weight);
    
    // 6. 总价
    const finalPrice = Math.max(0.01, basePrice + shippingFee + oversizeFee + machiningBaseFee);
    
    return {
      price: finalPrice.toFixed(2),
      weight: Number(weight.toFixed(3))
    };
  }