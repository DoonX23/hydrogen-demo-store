// 导出所有计算函数和类型
export { calculateSheetPriceAndWeight, type SheetCalculationProps } from './sheetCalculations';
export { calculateRodPriceAndWeight, type RodCalculationProps } from './rodCalculations';
export { calculateFilmPriceAndWeight, type FilmCalculationProps } from './filmCalculations';
export { calculateFlexibleRodPriceAndWeight, type FlexibleRodCalculationProps } from './flexibleRodCalculations';
export { calculateGasketPriceAndWeight, type GasketCalculationProps } from './gasketCalculations';
export { calculateDiscPriceAndWeight, type DiscCalculationProps } from './discCalculations';
export { type CalculationResult } from './common';

import { calculateSheetPriceAndWeight, type SheetCalculationProps } from './sheetCalculations';
import { calculateRodPriceAndWeight, type RodCalculationProps } from './rodCalculations';
import { calculateFilmPriceAndWeight, type FilmCalculationProps } from './filmCalculations';
import { calculateFlexibleRodPriceAndWeight, type FlexibleRodCalculationProps } from './flexibleRodCalculations';
import { calculateGasketPriceAndWeight, type GasketCalculationProps } from './gasketCalculations';
import { calculateDiscPriceAndWeight, type DiscCalculationProps } from './discCalculations';
import { type CalculationResult } from './common';

// 统一入口入参：按 formType 判别的联合类型。
// 每个分支只收该表单真实需要的字段——调用方不再传 diameter=""/lengthMm={0} 之类的假值；
// TS 按分支自动收窄，缺字段在编译期报错，彻底消除 || 0 静默兜底。
export type CalculationInput =
  | ({ formType: 'Sheet' } & SheetCalculationProps)
  | ({ formType: 'Rod' } & RodCalculationProps)
  | ({ formType: 'Film' } & FilmCalculationProps)
  | ({ formType: 'Flexible Rod' } & FlexibleRodCalculationProps)
  | ({ formType: 'Gasket' } & GasketCalculationProps)
  | ({ formType: 'Disc' } & DiscCalculationProps);

// 统一算价入口：按 formType 分发到六个具名计算函数。
// 未知 formType → null（fail-closed）：调用方必须显式处理，
// 不再兜底 price '0.00' 白送（旧 default 分支的失败方向是错的）。
export function calculatePriceAndWeight(
  input: CalculationInput,
): CalculationResult | null {
  switch (input.formType) {
    case 'Sheet':
      return calculateSheetPriceAndWeight(input);
    case 'Rod':
      return calculateRodPriceAndWeight(input);
    case 'Film':
      return calculateFilmPriceAndWeight(input);
    case 'Flexible Rod':
      return calculateFlexibleRodPriceAndWeight(input);
    case 'Gasket':
      return calculateGasketPriceAndWeight(input);
    case 'Disc':
      return calculateDiscPriceAndWeight(input);
    default:
      return null;
  }
}
