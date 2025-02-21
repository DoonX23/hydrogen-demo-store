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
    unitPrice
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

  // 计算运费
  const shippingTier = shippingTiers.find(
    tier => weight > tier.minWeight && weight <= tier.maxWeight
  );
  const unitShippingFee = shippingTier ? shippingTier.unitPrice : 15;
  const shippingFee = weight * unitShippingFee;

  // 计算总价
  const finalPrice = Math.max(0.01, Number((basePrice + precisionPrice + shippingFee).toFixed(2)));
  const result = {
    price: finalPrice.toFixed(2),
    weight: Number(weight.toFixed(3))
  };
  return result;
};
