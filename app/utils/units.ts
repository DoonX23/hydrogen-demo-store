// ~/utils/units.ts
// 单位换算引擎：前端双框输入、Radio 标签、服务端购物车行属性共用这一份纯函数
// 原则：换算只发生在 UI 边界，公式与 API 永远只用基准单位（mm / m），无单位分支
// 双框定稿：基准框显示基准单位（真值本体），换算框固定英制（in / ft，派生计算器）；
// 行属性 / Radio 标签永远双单位并注，不依赖任何单位制模式状态。

export type BaseUnit = 'mm' | 'm';
type DisplayUnit = 'mm' | 'm' | 'in' | 'ft';

// 每个基准单位的一切英制事实集中在一行：派生单位 + 换算比率
// （ratio 语义为「1 个英制单位 = ratio 个基准单位」）
export const IMPERIAL_RATIOS: Record<
  BaseUnit,
  {unit: 'in' | 'ft'; ratio: number}
> = {
  mm: {unit: 'in', ratio: 25.4},
  m: {unit: 'ft', ratio: 0.3048},
};

// 各单位显示小数位（输入框 / 括注 / 购物车行属性共用同一份，处处一致）：
// mm 1 位、m 1 位、in 2 位（0.1"≈2.54mm 对机加工太粗）、ft 1 位（0.1ft≈3cm）
const UNIT_PRECISION: Record<DisplayUnit, number> = {
  mm: 1,
  m: 1,
  in: 2,
  ft: 1,
};

// 基准值文本化：最多保留 digits 位小数并去掉尾零（152.40000000000002 → "152.4"）
// digits 不设默认值：小数位必须显式取自 UNIT_PRECISION，杜绝隐性精度陷阱
function formatBaseNumber(baseValue: number, digits: number): string {
  return String(Number(baseValue.toFixed(digits)));
}

// 基准值 → 双框显示文本（两框标准串的唯一来源：
// 初始化 / 回显 / 失焦守卫 / commit 全走这里，守卫比较的串与写入的串不可能不同源）
export function inputTexts(
  baseValue: number,
  baseUnit: BaseUnit,
): {base: string; imperial: string} {
  const {unit, ratio} = IMPERIAL_RATIOS[baseUnit];
  return {
    base: formatBaseNumber(baseValue, UNIT_PRECISION[baseUnit]),
    imperial: formatBaseNumber(baseValue / ratio, UNIT_PRECISION[unit]),
  };
}

// 英制输入 → 基准值（完整精度，不四舍五入，精度只在显示层处理）
export function imperialToBase(inputValue: number, baseUnit: BaseUnit): number {
  return inputValue * IMPERIAL_RATIOS[baseUnit].ratio;
}

// 购物车行属性 / Radio 标签统一格式：永远双单位并注（100mm (3.94") / 50m (164.0ft)）
// 基准真值在前原样保留；英制括注只是辅助显示，模具真值绝不圆整
export function formatDimension(baseValue: number, baseUnit: BaseUnit): string {
  const {unit, ratio} = IMPERIAL_RATIOS[baseUnit];
  const display = (baseValue / ratio).toFixed(UNIT_PRECISION[unit]);
  const suffix = unit === 'in' ? '"' : unit;
  return `${formatBaseNumber(baseValue, UNIT_PRECISION[baseUnit])}${baseUnit} (${display}${suffix})`;
}