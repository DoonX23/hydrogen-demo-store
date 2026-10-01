// ~/utils/calculations/index.ts
// 计算层统一出口（barrel）：
// - formSpecs.ts：spec 表（六形态差异的唯一描述点）+ 算价管道 + 校验 + 行属性组装
//   + 前后端共用机器（表单渲染 / 组装入参同源）
// - common.ts：附加费函数（精度 / 超长 / 加工起始 / 运费）
// 前端 SpecForm / PriceDisplay、加购路由（将来还有 Cart Transform Function）全部经此入口导入。

export {
  calculateShipping,
  calculateOversizeFee,
  calculatePrecisionFee,
  calculateMachiningBaseFee,
  type CalculationResult,
} from './common';

export {
  FORM_SPECS,
  getSpec,
  calculatePriceAndWeight,
  validateCustomInput,
  buildLineAttributes,
  isValidPrecision,
  isFieldValid,
  fieldErrorMessage,
  fieldBounds,
  getInitialFieldValues,
  assembleCalculationInput,
  type CalculationInput,
  type CalcInput,
  type FormSpec,
  type InputSpec,
  type FixedAttributeSpec,
  type FormInputField,
  type LimitKey,
  type InitialKey,
  type SheetCalculationProps,
  type RodCalculationProps,
  type FilmCalculationProps,
  type FlexibleRodCalculationProps,
  type GasketCalculationProps,
  type DiscCalculationProps,
} from './formSpecs';
