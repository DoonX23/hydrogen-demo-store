// utils/calculations.ts
// 定义计算参数接口
export interface CalculationProps {
  formType: string;
  thickness: string;
  diameter: string;
  density: number;
  lengthMm?: number;  // Sheet和Rod用
  lengthM?: number;   // Film用
  widthMm: number;
  precision: string;  
  quantity: number;
  unitPrice: number;
}

// 定义运费阶梯接口
interface ShippingTier {
  minWeight: number;
  maxWeight: number;
  unitPrice: number;
}

// 定义运费阶梯数组
const shippingTiers: ShippingTier[] = [
  { minWeight: 0, maxWeight: 0.1, unitPrice: 40 },
  { minWeight: 0.1, maxWeight: 0.5, unitPrice: 30 },
  { minWeight: 0.5, maxWeight: 1, unitPrice: 20 },
  { minWeight: 1, maxWeight: 2, unitPrice: 18 },
  { minWeight: 2, maxWeight: 5, unitPrice: 15 },
  { minWeight: 5, maxWeight: 10, unitPrice: 12 },
  { minWeight: 10, maxWeight: Infinity, unitPrice: 12 }
];

// 定义超长附加费阶梯接口
interface OversizeTier {
  min: number;
  max: number;
  fee: number;
}

// 定义超长附加费阶梯数组
const oversizeTiers: OversizeTier[] = [
  { min: 0, max: 520, fee: 0 },      // 不收取附加费
  { min: 520, max: 1100, fee: 20 },  // 超过520mm但小于1100mm，收取20刀
  { min: 1100, max: Infinity, fee: 40 } // 超过1100mm，收取40刀
];

// 计算价格和重量的核心函数
export const calculatePriceAndWeight = (props: CalculationProps): {
  price: string;
  weight: number;
} => {
  const {
    formType,
    thickness,
    diameter,
    density,
    lengthMm,
    lengthM,
    widthMm,
    precision,
    unitPrice,
    quantity
  } = props;

  let weight = 0;

  // 根据不同产品类型计算重量
  switch(formType) {
    case 'Film':
      const thicknessNumFilm = parseFloat(thickness);
      const lengthMmFilm = (lengthM || 0) * 1000;
      const volumeMm3Film = lengthMmFilm * widthMm * thicknessNumFilm; 
      weight = (volumeMm3Film * density) / 1000000;
      break;
      
    case 'Sheet':
      const thicknessNumSheet = parseFloat(thickness);
      const volumeMm3Sheet = (lengthMm || 0) * widthMm * thicknessNumSheet;
      weight = (volumeMm3Sheet * density) / 1000000;
      break;
      
    case 'Flexible Rod':
      const flexDiameterNum = parseFloat(diameter);
      const flexLengthMm = (lengthM || 0) * 1000;
      const flexRodVolume = Math.PI * Math.pow(flexDiameterNum/2, 2) * flexLengthMm;
      weight = (flexRodVolume * density) / 1000000;
      break;

    case 'Rod':
      const diameterNum = parseFloat(diameter);
      const rodVolume = Math.PI * Math.pow(diameterNum/2, 2) * (lengthMm || 0);
      weight = (rodVolume * density) / 1000000;
      break;

    default:
      weight = 0.001; 
  }

  weight = Math.max(0.001, weight);

  const basePrice = weight * unitPrice;
  
  let precisionPrice = 0;
  if (formType !== 'Film') {
    switch(precision) {
      case 'High (±0.2mm)':
        precisionPrice = 1.5;
        break;
      case 'Normal (±2mm)':
        precisionPrice = 0.5;
        break;
    }
  }
  
  // 计算超长附加费
  let oversizeFee = 0;
  
  // 根据不同材料类型检查尺寸并计算附加费
  if (formType === 'Film') {
    // 对于Film，只检查宽度
    oversizeFee = calculateOversizeFee(widthMm, quantity);
  } else if (formType === 'Sheet') {
    // 对于Sheet，检查宽度和长度，取较高的附加费
    const widthFee = calculateOversizeFee(widthMm, quantity);
    const lengthFee = calculateOversizeFee(lengthMm || 0, quantity);
    oversizeFee = Math.max(widthFee, lengthFee);
  } else if (formType === 'Rod') {
    // 对于Rod，只检查长度
    oversizeFee = calculateOversizeFee(lengthMm || 0, quantity);
  }
  // Flexible Rod不收取超长附加费

  // 计算运费
  const shippingTier = shippingTiers.find(
    tier => weight > tier.minWeight && weight <= tier.maxWeight
  );
  const unitShippingFee = shippingTier ? shippingTier.unitPrice : 15;
  const shippingFee = weight * unitShippingFee;

  // 计算总价，加入超长附加费
  const finalPrice = Math.max(0.01, Number((basePrice + precisionPrice + shippingFee + oversizeFee).toFixed(2)));
  const result = {
    price: finalPrice.toFixed(2),
    weight: Number(weight.toFixed(3))
  };
  return result;
};

/**
 * 计算超长附加费
 * @param dimension 需要检查的尺寸（宽度或长度，单位mm）
 * @param quantity 订购数量
 * @returns 每单位的超长附加费
 */
function calculateOversizeFee(dimension: number, quantity: number): number {
  // 查找符合尺寸的阶梯
  const tier = oversizeTiers.find(
    tier => dimension > tier.min && dimension <= tier.max
  );
  
  // 如果找到阶梯，按照数量平均返回费用；否则不收费
  return tier ? tier.fee / quantity : 0;
}