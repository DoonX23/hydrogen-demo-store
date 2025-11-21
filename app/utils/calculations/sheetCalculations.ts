import { 
    calculateShipping, 
    calculateOversizeFee, 
    calculatePrecisionFee,
    type CalculationResult 
  } from './common';
  
  export interface SheetCalculationProps {
    thickness: string;
    density: number;
    lengthMm: number;
    widthMm: number;
    precision: string;
    quantity: number;
    unitPrice: number;
  }
  
  export function calculateSheetPriceAndWeight(props: SheetCalculationProps): CalculationResult {
    const { thickness, density, lengthMm, widthMm, precision, quantity, unitPrice } = props;
    
    // 计算体积和重量
    const thicknessNum = parseFloat(thickness);
    const volumeMm3 = lengthMm * widthMm * thicknessNum;
    let weight = (volumeMm3 * density) / 1000000;
    weight = Math.max(0.001, weight);
    
    // 基础价格
    const basePrice = weight * unitPrice;
    
    // 精度费用
    const precisionPrice = calculatePrecisionFee(precision,quantity);
    
    // 超长附加费（取长度和宽度的最大值）
    const lengthFee = calculateOversizeFee(lengthMm, quantity);
    const widthFee = calculateOversizeFee(widthMm, quantity);
    const oversizeFee = Math.max(lengthFee, widthFee);
    
    // 运费
    const shippingFee = calculateShipping(weight);
    
    // 总价
    const finalPrice = Math.max(0.01, basePrice + precisionPrice + shippingFee + oversizeFee);
    
    return {
      price: finalPrice.toFixed(2),
      weight: Number(weight.toFixed(3))
    };
  }