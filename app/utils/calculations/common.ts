// 运费阶梯接口
interface ShippingTier {
    minWeight: number;
    maxWeight: number;
    unitPrice: number;
  }
  
  // 运费阶梯配置
  const shippingTiers: ShippingTier[] = [
    { minWeight: 0, maxWeight: 0.1, unitPrice: 40 },
    { minWeight: 0.1, maxWeight: 0.5, unitPrice: 30 },
    { minWeight: 0.5, maxWeight: 1, unitPrice: 20 },
    { minWeight: 1, maxWeight: 2, unitPrice: 18 },
    { minWeight: 2, maxWeight: 5, unitPrice: 15 },
    { minWeight: 5, maxWeight: 10, unitPrice: 12 },
    { minWeight: 10, maxWeight: Infinity, unitPrice: 12 }
  ];
  
  // 超长附加费阶梯接口
  interface OversizeTier {
    min: number;
    max: number;
    fee: number;
  }
  
  // 超长附加费阶梯配置
  const oversizeTiers: OversizeTier[] = [
    { min: 0, max: 520, fee: 0 },
    { min: 520, max: 1100, fee: 20 },
    { min: 1100, max: Infinity, fee: 40 }
  ];
  
  // 加工起始费配置
  const MACHINING_BASE_FEE = 20; // 20刀

  // 计算结果接口
  export interface CalculationResult {
    price: string;
    weight: number;
  }
  
  // 计算运费
  export function calculateShipping(weight: number): number {
    const tier = shippingTiers.find(
      tier => weight > tier.minWeight && weight <= tier.maxWeight
    );
    const unitShippingFee = tier ? tier.unitPrice : 15;
    return weight * unitShippingFee;
  }
  
  // 计算超长附加费
  export function calculateOversizeFee(dimension: number, quantity: number): number {
    const tier = oversizeTiers.find(
      tier => dimension > tier.min && dimension <= tier.max
    );
    return tier ? tier.fee / quantity : 0;
  }
  
  // 计算精度费用
  export function calculatePrecisionFee(precision: string, quantity: number): number {
    switch(precision) {
      case 'High (±0.2mm)':
        return 0.5 + MACHINING_BASE_FEE / quantity;
      case 'Normal (±2mm)':
        return 0.5;
      default:
        return 0;
    }
  }

  // 新增：计算加工起始费
  export function calculateMachiningBaseFee(quantity: number): number {
    return MACHINING_BASE_FEE / quantity;
  }