import { 
    calculateShipping, 
    calculateOversizeFee, 
    calculatePrecisionFee,
    type CalculationResult 
  } from './common';
  
  export interface RodCalculationProps {
    diameter: string;
    density: number;
    lengthMm: number;
    precision: string;
    quantity: number;
    unitPrice: number;
  }
  
  export function calculateRodPriceAndWeight(props: RodCalculationProps): CalculationResult {
    const { diameter, density, lengthMm, precision, quantity, unitPrice } = props;
    
    // 计算体积和重量
    const diameterNum = parseFloat(diameter);
    const rodVolume = Math.PI * Math.pow(diameterNum/2, 2) * lengthMm;
    let weight = (rodVolume * density) / 1000000;
    weight = Math.max(0.001, weight);
    
    // 基础价格
    const basePrice = weight * unitPrice;
    
    // 精度费用
    const precisionPrice = calculatePrecisionFee(precision,quantity);
    
    // 超长附加费（只检查长度）
    const oversizeFee = calculateOversizeFee(lengthMm, quantity);
    
    // 运费
    const shippingFee = calculateShipping(weight);
    
    // 总价
    const finalPrice = Math.max(0.01, basePrice + precisionPrice + shippingFee + oversizeFee);
    
    return {
      price: finalPrice.toFixed(2),
      weight: Number(weight.toFixed(3))
    };
  }