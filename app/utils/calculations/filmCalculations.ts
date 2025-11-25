import { 
    calculateShipping, 
    calculateOversizeFee,
    type CalculationResult 
  } from './common';
  
  export interface FilmCalculationProps {
    thickness: string;
    density: number;
    lengthM: number;
    widthMm: number;
    quantity: number;
    unitPrice: number;
  }
  
  export function calculateFilmPriceAndWeight(props: FilmCalculationProps): CalculationResult {
    const { thickness, density, lengthM, widthMm, quantity, unitPrice } = props;
    
    // 计算体积和重量
    const thicknessNum = parseFloat(thickness);
    const lengthMm = lengthM * 1000;  // 转换为毫米
    const volumeMm3 = lengthMm * widthMm * thicknessNum;
    let weight = (volumeMm3 * density) / 1000000;
    weight = Math.max(0.001, weight);
    
    // 基础价格
    const basePrice = weight * unitPrice;
    
    // 超长附加费（只检查宽度）
    const oversizeFee = calculateOversizeFee(widthMm, quantity);
    
    // 运费
    const shippingFee = calculateShipping(weight,quantity);
    
    // 总价
    const finalPrice = Math.max(0.01, basePrice + shippingFee + oversizeFee);
    
    return {
      price: finalPrice.toFixed(2),
      weight: Number(weight.toFixed(3))
    };
  }