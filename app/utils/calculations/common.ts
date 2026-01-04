// 运费阶梯接口 (已注释)
// interface ShippingTier {
//   minWeight: number;
//   maxWeight: number;
//   unitPrice: number;
// }

// 运费阶梯配置 (已注释)
// const shippingTiers: ShippingTier[] = [
//   { minWeight: 0, maxWeight: 0.1, unitPrice: 40 },
//   { minWeight: 0.1, maxWeight: 0.5, unitPrice: 30 },
//   { minWeight: 0.5, maxWeight: 1, unitPrice: 20 },
//   { minWeight: 1, maxWeight: 2, unitPrice: 18 },
//   { minWeight: 2, maxWeight: 5, unitPrice: 15 },
//   { minWeight: 5, maxWeight: 10, unitPrice: 12 },
//   { minWeight: 10, maxWeight: Infinity, unitPrice: 12 }
// ];
  
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
  
// 定义统一运费单价：5美元/公斤
const FLAT_SHIPPING_RATE = 5;
// 修改后的计算运费函数 - 使用阶梯叠加方式
export function calculateShipping(weight: number, quantity: number): number {
  // 计算总重量
  const totalWeight = weight * quantity;
  // 2. 根据总重量和统一费率计算总运费
  const totalShippingFee = totalWeight * FLAT_SHIPPING_RATE;
  
  // 初始化总运费为0
  //let totalShippingFee = 0;
  // 遍历每个运费阶梯，累加计算
  //for (const tier of shippingTiers) {
    // 如果总重量小于等于当前阶梯的最小重量，跳过
    //if (totalWeight <= tier.minWeight) {
      //break;
   // }
    
    // 计算在当前阶梯内的重量
    // 取总重量和阶梯最大重量中的较小值，减去阶梯最小重量
   // const weightInTier = Math.min(totalWeight, tier.maxWeight) - tier.minWeight;
    
    // 累加当前阶梯的运费
    //totalShippingFee += weightInTier * tier.unitPrice;
    
    // 如果总重量在当前阶梯内，结束计算
    //if (totalWeight <= tier.maxWeight) {
      //break;
    //}
  //}
  // 将总运费平摊到每个产品上
  return totalShippingFee / quantity;
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