// 单位换算引擎：前端输入框、Radio 标签、服务端购物车行属性共用这一份纯函数
// 原则：换算只发生在 UI 边界，公式与 API 永远只用基准单位（mm / m），无单位分支
// 双基准定稿：短尺寸 mm（Sheet/Rod/Gasket/Disc），长尺寸 m（Film/Flexible Rod）

export type UnitSystem = 'metric' | 'imperial';
export type BaseUnit = 'mm' | 'm';
type DisplayUnit = 'mm' | 'in' | 'm' | 'ft';

// 换算比率：1 显示单位 = ? 基准单位
export const UNIT_RATIOS: Record<
  BaseUnit,
  Record<UnitSystem, {unit: DisplayUnit; ratio: number}>
> = {
  mm: {
    metric: {unit: 'mm', ratio: 1},
    imperial: {unit: 'in', ratio: 25.4},
  },
  m: {
    metric: {unit: 'm', ratio: 1},
    imperial: {unit: 'ft', ratio: 0.3048},
  },
};

// 各单位显示小数位（如需更细显示精度只改这一处）
// mm/m 基准回显基本是整数或一位小数；in 保持 2 位（0.1"≈2.54mm 对机加工太粗）；ft 1 位足够（0.1ft≈3cm）
export const UNIT_PRECISION: Record<DisplayUnit, number> = {
  mm: 1,
  in: 2,
  m: 1,
  ft: 1,
};

// 基准值 → 当前单位制显示值（按单位精度取整，用于输入框回显）
export function convertFromBase(
  baseValue: number,
  baseUnit: BaseUnit,
  unitSystem: UnitSystem,
): number {
  const {unit, ratio} = UNIT_RATIOS[baseUnit][unitSystem];
  return Number((baseValue / ratio).toFixed(UNIT_PRECISION[unit]));
}

// 用户输入（当前单位制）→ 基准值（完整精度，不四舍五入，精度只在显示层处理）
export function convertToBase(
  inputValue: number,
  baseUnit: BaseUnit,
  unitSystem: UnitSystem,
): number {
  const {ratio} = UNIT_RATIOS[baseUnit][unitSystem];
  return inputValue * ratio;
}

// 基准值文本化：最多保留 2 位小数并去掉尾零（152.40000000000002 → "152.4"）
function formatBaseNumber(baseValue: number): string {
  return String(Number(baseValue.toFixed(2)));
}

// 购物车行属性 / Radio 标签统一格式
// 公制：只显示基准（100mm / 50m）
// 英制：基准在前 + 括注换算值（100mm (3.94") / 50m (164.04ft)），模具真值绝不圆整
export function formatDimension(
  baseValue: number,
  baseUnit: BaseUnit,
  unitSystem: UnitSystem,
): string {
  const {unit, ratio} = UNIT_RATIOS[baseUnit][unitSystem];

  if (unitSystem === 'metric') {
    return `${formatBaseNumber(baseValue)}${baseUnit}`;
  }

  const display = (baseValue / ratio).toFixed(UNIT_PRECISION[unit]);
  const suffix = unit === 'in' ? '"' : unit;
  return `${formatBaseNumber(baseValue)}${baseUnit} (${display}${suffix})`;
}
