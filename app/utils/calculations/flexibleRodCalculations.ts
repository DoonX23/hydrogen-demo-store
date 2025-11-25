import { 
    calculateShipping,
    type CalculationResult 
  } from './common';
  
  export interface FlexibleRodCalculationProps {
    diameter: string;
    density: number;
    lengthM: number;
    quantity: number;
    unitPrice: number;
  }
  
  export function calculateFlexibleRodPriceAndWeight(props: FlexibleRodCalculationProps): CalculationResult {
    const { diameter, density, lengthM, quantity, unitPrice } = props;
    
    // 计算体积和重量
    const diameterNum = parseFloat(diameter);
    const lengthMm = lengthM * 1000;  // 转换为毫米
    const rodVolume = Math.PI * Math.pow(diameterNum/2, 2) * lengthMm;
    let weight = (rodVolume * density) / 1000000;
    weight = Math.max(0.001, weight);
    
    // 基础价格
    const basePrice = weight * unitPrice;
    
    // 运费（Flexible Rod不收取超长附加费和精度费用）
    const shippingFee = calculateShipping(weight,quantity);
    
    // 总价
    const finalPrice = Math.max(0.01, basePrice + shippingFee);
    
    return {
      price: finalPrice.toFixed(2),
      weight: Number(weight.toFixed(3))
    };
  }