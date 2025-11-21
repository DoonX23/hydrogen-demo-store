// 导出所有计算函数和类型
export { calculateSheetPriceAndWeight, type SheetCalculationProps } from './sheetCalculations';
export { calculateRodPriceAndWeight, type RodCalculationProps } from './rodCalculations';
export { calculateFilmPriceAndWeight, type FilmCalculationProps } from './filmCalculations';
export { calculateFlexibleRodPriceAndWeight, type FlexibleRodCalculationProps } from './flexibleRodCalculations';
export { calculateGasketPriceAndWeight, type GasketCalculationProps } from './gasketCalculations'; // 新增
export { calculateDiscPriceAndWeight, type DiscCalculationProps } from './discCalculations'; // 新增
export { type CalculationResult } from './common';

// 为了保持向后兼容，导出原来的函数
import { calculateSheetPriceAndWeight } from './sheetCalculations';
import { calculateRodPriceAndWeight } from './rodCalculations';
import { calculateFilmPriceAndWeight } from './filmCalculations';
import { calculateFlexibleRodPriceAndWeight } from './flexibleRodCalculations';
import { calculateGasketPriceAndWeight } from './gasketCalculations'; // 新增
import { calculateDiscPriceAndWeight } from './discCalculations'; // 新增

// 原来的计算参数接口
export interface CalculationProps {
  formType: string;
  thickness: string;
  diameter: string;
  density: number;
  lengthMm?: number;
  lengthM?: number;
  widthMm: number;
  innerDiameterMm?: number;    // 新增（可选）
  outerDiameterMm?: number;    // 新增（可选）
  diameterMm?: number;         // 新增：Disc使用
  precision: string;
  quantity: number;
  unitPrice: number;
}

// 原来的函数，现在重构为调用新的分离函数
export function calculatePriceAndWeight(props: CalculationProps) {
  const { formType } = props;
  
  switch(formType) {
    case 'Sheet':
      return calculateSheetPriceAndWeight({
        thickness: props.thickness,
        density: props.density,
        lengthMm: props.lengthMm || 0,
        widthMm: props.widthMm,
        precision: props.precision,
        quantity: props.quantity,
        unitPrice: props.unitPrice
      });
      
    case 'Rod':
      return calculateRodPriceAndWeight({
        diameter: props.diameter,
        density: props.density,
        lengthMm: props.lengthMm || 0,
        precision: props.precision,
        quantity: props.quantity,
        unitPrice: props.unitPrice
      });
      
    case 'Film':
      return calculateFilmPriceAndWeight({
        thickness: props.thickness,
        density: props.density,
        lengthM: props.lengthM || 0,
        widthMm: props.widthMm,
        quantity: props.quantity,
        unitPrice: props.unitPrice
      });
      
    case 'Flexible Rod':
      return calculateFlexibleRodPriceAndWeight({
        diameter: props.diameter,
        density: props.density,
        lengthM: props.lengthM || 0,
        quantity: props.quantity,
        unitPrice: props.unitPrice
      });
      
    case 'Gasket':  // 新增case
    return calculateGasketPriceAndWeight({
      thickness: props.thickness,
      density: props.density,
      innerDiameterMm: props.innerDiameterMm || 0,
      outerDiameterMm: props.outerDiameterMm || 0,
      quantity: props.quantity,
      unitPrice: props.unitPrice
    });

    case 'Disc':  // 新增case
    return calculateDiscPriceAndWeight({
      thickness: props.thickness,
      density: props.density,
      diameterMm: props.diameterMm || 0,
      quantity: props.quantity,
      unitPrice: props.unitPrice
    });

    default:
      return { price: '0.00', weight: 0.001 };
  }
}