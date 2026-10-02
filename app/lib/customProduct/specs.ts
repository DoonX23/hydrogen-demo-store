// ~/lib/customProduct/specs.ts
// 形态差异唯一的描述点（spec 表）：六种 formType 的几何体积、计费基准、费用开关、
// 表单字段 / 行属性 / 范围校验全部收敛为一条记录；算价管道、校验、行属性组装三段
// 流程代码只写一遍、由数据驱动。加第 7 种形态 = 只加一条 spec + 一个联合分支。
//
// 类型约定：表定义处每个形态的回调拿到精确的 CalcInput<F>（编译期对齐，传错字段
// 直接报错）；统一消费（管道 / 循环）经 getSpec 擦除为联合视图——安全性由 spec 表
// 与 CalculationInput 联合同构保证（字段互斥，运行时分支已窄化）。
import type {CustomProductConfig, FormType} from './config';
import {formatDimension, type BaseUnit, type UnitSystem} from '~/utils/units';
import {
  calculateMachiningBaseFee,
  calculateOversizeFee,
  calculatePrecisionFee,
  calculateShipping,
  type CalculationResult,
} from './fees';

// --- 入参类型（判别联合，每个分支只收该表单真实需要的字段） ---
// TS 按分支自动收窄，缺字段在编译期报错，彻底消除 || 0 静默兜底。

export interface SheetCalculationProps {
  thickness: string;
  density: number;
  lengthMm: number;
  widthMm: number;
  precision: string;
  quantity: number;
  unitPrice: number;
}

export interface RodCalculationProps {
  diameter: string;
  density: number;
  lengthMm: number;
  precision: string;
  quantity: number;
  unitPrice: number;
}

export interface FilmCalculationProps {
  thickness: string;
  density: number;
  lengthM: number;
  widthMm: number;
  quantity: number;
  unitPrice: number;
}

export interface FlexibleRodCalculationProps {
  diameter: string;
  density: number;
  lengthM: number;
  quantity: number;
  unitPrice: number;
}

export interface GasketCalculationProps {
  thickness: string;
  density: number;
  innerDiameterMm: number;
  outerDiameterMm: number;
  quantity: number;
  unitPrice: number;
}

export interface DiscCalculationProps {
  thickness: string;
  density: number;
  diameterMm: number;
  quantity: number;
  unitPrice: number;
}

export type CalculationInput =
  | ({formType: 'Sheet'} & SheetCalculationProps)
  | ({formType: 'Rod'} & RodCalculationProps)
  | ({formType: 'Film'} & FilmCalculationProps)
  | ({formType: 'Flexible Rod'} & FlexibleRodCalculationProps)
  | ({formType: 'Gasket'} & GasketCalculationProps)
  | ({formType: 'Disc'} & DiscCalculationProps);

// 按形态窄化后的入参（spec 回调的参数类型）
export type CalcInput<F extends FormType> = Extract<
  CalculationInput,
  {formType: F}
>;

// --- spec 类型 ---

// 客户申报的尺寸字段（六种形态全部枚举；表单 name、行属性 key、范围键由此驱动）
export type FormInputField =
  | 'lengthMm'
  | 'widthMm'
  | 'lengthM'
  | 'innerDiameterMm'
  | 'outerDiameterMm'
  | 'diameterMm';

// 范围键：min<键大写> / max<键大写> 对应 NormalizedLimits 的字段
export type LimitKey =
  | 'length'
  | 'width'
  | 'innerDiameter'
  | 'outerDiameter'
  | 'diameter';

const capitalize = (key: LimitKey): Capitalize<LimitKey> =>
  (key.charAt(0).toUpperCase() + key.slice(1)) as Capitalize<LimitKey>;

// number 字段初始值来源：config.initial 的键（前端表单进站初始值由此驱动）
export type InitialKey = keyof CustomProductConfig['initial'];

export interface InputSpec {
  field: FormInputField;          // CalculationInput 字段名 = 表单 name
  label: string;                  // 购物车行属性 key / 校验错误消息前缀
  unit: BaseUnit;                 // 基准单位（mm / m），行属性格式化用
  limit?: LimitKey;               // 范围校验 → config.limits.minXxx/maxXxx
  fromWidthOptions?: boolean;     // Film 宽度：按 config.widthOptions 档位枚举校验
  // --- 前端表单渲染（spec 字段区化） ---
  widget?: 'number' | 'radio';    // 控件类型，缺省 number（radio 选项来自 widthOptions）
  initKey?: InitialKey;           // number 字段进表单初始值 → config.initial[initKey]
}

export interface FixedAttributeSpec {
  label: 'Thickness' | 'Diameter';
  field: 'thickness' | 'diameter';
}

export interface FormSpec<F extends FormType> {
  // 固定参数行属性（值来自 metafield 重建的 config，客户端不可伪造）
  fixedAttribute?: FixedAttributeSpec;
  // 客户申报的尺寸字段（行属性 + 范围校验 + 表单字段三用）
  inputs: InputSpec[];
  // 是否收精度费（同时输出 Precision 行属性；仅 Sheet / Rod）
  precision?: boolean;
  // 几何体积（mm³）：六形态唯一的几何差异点
  volume: (p: CalcInput<F>) => number;
  // 计费重量（kg）：Disc / Gasket 按外切方板计费，缺省 = 实际重量
  billWeight?: (p: CalcInput<F>) => number;
  // 超长附加费参照维度（mm），缺省不收
  oversizeDim?: (p: CalcInput<F>) => number;
  // 加工费：max(minFee, 材料费 × ratio)（Disc / Gasket）
  machining?: {minFee: number; ratio: number};
  // 跨字段规则（Gasket 内径 < 外径之类塞不进通用循环的钩子）
  crossValidate?: (
    p: CalcInput<F>,
    config: CustomProductConfig,
  ) => string[];
  // --- 前端表单渲染（spec 字段区化） ---
  // 进表单初始数量（Gasket=10 为历史行为原样保留，缺省 1）
  defaultQuantity?: number;
  // 精度单选初始值：'config' 取产品 machiningPrecision（Rod 历史行为），缺省固定 Normal (±2mm)（Sheet）
  precisionInitial?: 'config';
}

// --- spec 表：六种形态的全部差异，一行形态一条记录 ---

export const FORM_SPECS: {[F in FormType]: FormSpec<F>} = {
  Sheet: {
    fixedAttribute: {label: 'Thickness', field: 'thickness'},
    inputs: [
      {field: 'lengthMm', label: 'Length', unit: 'mm', limit: 'length', initKey: 'length'},
      {field: 'widthMm', label: 'Width', unit: 'mm', limit: 'width', initKey: 'width'},
    ],
    precision: true,
    volume: (p) => p.lengthMm * p.widthMm * parseFloat(p.thickness),
    oversizeDim: (p) => Math.max(p.lengthMm, p.widthMm),
  },

  // inputs 顺序 = 表单渲染顺序 = 行属性顺序（宽度在前：Film 页面与购物车属性均 Width 在 Length 前）
  Film: {
    fixedAttribute: {label: 'Thickness', field: 'thickness'},
    inputs: [
      {field: 'widthMm', label: 'Width', unit: 'mm', widget: 'radio', fromWidthOptions: true},
      {field: 'lengthM', label: 'Length', unit: 'm', limit: 'length', initKey: 'length'},
    ],
    volume: (p) => p.lengthM * 1000 * p.widthMm * parseFloat(p.thickness),
    oversizeDim: (p) => p.widthMm,
  },

  Rod: {
    fixedAttribute: {label: 'Diameter', field: 'diameter'},
    inputs: [{field: 'lengthMm', label: 'Length', unit: 'mm', limit: 'length', initKey: 'length'}],
    precision: true,
    precisionInitial: 'config',
    volume: (p) =>
      Math.PI * Math.pow(parseFloat(p.diameter) / 2, 2) * p.lengthMm,
    oversizeDim: (p) => p.lengthMm,
  },

  'Flexible Rod': {
    fixedAttribute: {label: 'Diameter', field: 'diameter'},
    inputs: [{field: 'lengthM', label: 'Length', unit: 'm', limit: 'length', initKey: 'length'}],
    volume: (p) =>
      Math.PI * Math.pow(parseFloat(p.diameter) / 2, 2) * (p.lengthM * 1000),
  },

  Gasket: {
    fixedAttribute: {label: 'Thickness', field: 'thickness'},
    inputs: [
      {
        field: 'innerDiameterMm',
        label: 'Inner Diameter',
        unit: 'mm',
        limit: 'innerDiameter',
        initKey: 'innerDiameter',
      },
      {
        field: 'outerDiameterMm',
        label: 'Outer Diameter',
        unit: 'mm',
        limit: 'outerDiameter',
        initKey: 'outerDiameter',
      },
    ],
    volume: (p) =>
      Math.PI *
      (Math.pow(p.outerDiameterMm / 2, 2) - Math.pow(p.innerDiameterMm / 2, 2)) *
      parseFloat(p.thickness),
    billWeight: (p) =>
      (Math.pow(p.outerDiameterMm, 2) * parseFloat(p.thickness) * p.density) /
      1_000_000,
    oversizeDim: (p) => p.outerDiameterMm,
    machining: {minFee: 0.2, ratio: 0.5},
    crossValidate: (p) =>
      p.innerDiameterMm >= p.outerDiameterMm
        ? ['Inner diameter must be smaller than outer diameter']
        : [],
    defaultQuantity: 10,
  },

  Disc: {
    fixedAttribute: {label: 'Thickness', field: 'thickness'},
    inputs: [
      {field: 'diameterMm', label: 'Diameter', unit: 'mm', limit: 'diameter', initKey: 'diameter'},
    ],
    volume: (p) =>
      Math.PI * Math.pow(p.diameterMm / 2, 2) * parseFloat(p.thickness),
    billWeight: (p) =>
      (Math.pow(p.diameterMm, 2) * parseFloat(p.thickness) * p.density) /
      1_000_000,
    oversizeDim: (p) => p.diameterMm,
    machining: {minFee: 0.1, ratio: 0.3},
  },
};

// --- 统一消费视图（擦除联合） ---
// 表定义处各形态回调是精确类型；管道 / 校验 / 行属性循环拿到的是 CalculationInput
// 联合，参数逆变无法直接赋值，故经此视图擦除。安全性：spec 表与联合同构，运行时
// formType 分支已窄化到对应记录，字段必然存在。

interface ErasedFormSpec {
  fixedAttribute?: FixedAttributeSpec;
  inputs: InputSpec[];
  precision?: boolean;
  volume: (p: CalculationInput) => number;
  billWeight?: (p: CalculationInput) => number;
  oversizeDim?: (p: CalculationInput) => number;
  machining?: {minFee: number; ratio: number};
  crossValidate?: (
    p: CalculationInput,
    config: CustomProductConfig,
  ) => string[];
  defaultQuantity?: number;
  precisionInitial?: 'config';
}

export function getSpec(formType: FormType): ErasedFormSpec {
  return (FORM_SPECS as unknown as Record<FormType, ErasedFormSpec>)[formType];
}

// 联合上的字段读取（分支已窄化，字段必然存在；联合直接索引 TS 会报缺字段）
const fieldValue = (props: CalculationInput, field: FormInputField): number =>
  (props as unknown as Record<FormInputField, number>)[field];

const fixedValue = (
  props: CalculationInput,
  field: 'thickness' | 'diameter',
): string =>
  (props as unknown as Record<'thickness' | 'diameter', string>)[field];

const precisionOf = (props: CalculationInput): string =>
  (props as unknown as {precision?: string}).precision ?? '';

// precision 规则（与表单联动一致，将来 function 的 parseLineAttributes 复用同一套规则）：
// 枚举精确匹配；产品只配了 Normal 时禁止 High
export function isValidPrecision(
  precision: string,
  config: CustomProductConfig,
): boolean {
  if (precision !== 'High (±0.2mm)' && precision !== 'Normal (±2mm)') {
    return false;
  }
  if (
    config.machiningPrecision === 'Normal (±2mm)' &&
    precision === 'High (±0.2mm)'
  ) {
    return false;
  }
  return true;
}

// 粗校验（UX 反馈，非安全权威）：全局基础项 + spec 驱动的逐字段范围 / 档位 /
// precision / 跨字段规则。安全权威是"固定参数一律来自 metafield"这条铁律。
export function validateCustomInput(
  props: CalculationInput,
  config: CustomProductConfig,
): string[] {
  const errors: string[] = [];

  // 1. 全局基础校验
  if (isNaN(props.quantity) || props.quantity < 1) {
    errors.push('Quantity must be at least 1');
  }
  if (props.quantity > 10000) {
    errors.push('Quantity cannot exceed 10000');
  }
  if (!Number.isFinite(props.density) || props.density <= 0) {
    errors.push('Product density is not configured');
  }
  if (!Number.isFinite(props.unitPrice) || props.unitPrice <= 0) {
    errors.push('Product unit price is not configured');
  }

  const spec = getSpec(props.formType);

  // 2. 固定参数缺失（metafield 未配置该形态需要的 thickness / diameter）
  if (spec.fixedAttribute && !fixedValue(props, spec.fixedAttribute.field)) {
    errors.push(`${spec.fixedAttribute.label} is required`);
  }

  // 3. 逐字段范围校验（spec 驱动，前端红框同一实现；范围即产品 metafield 配置的 dimension_limitation）
  for (const field of spec.inputs) {
    if (!isFieldValid(field, fieldValue(props, field.field), config)) {
      errors.push(fieldErrorMessage(field, config));
    }
  }

  // 4. precision 联动规则
  if (spec.precision) {
    if (!isValidPrecision(precisionOf(props), config)) {
      errors.push('Invalid precision');
    }
  }

  // 5. 跨字段规则（Gasket 内径 < 外径）
  errors.push(...(spec.crossValidate?.(props, config) ?? []));

  return errors;
}

// --- 前端 / 路由共用机器（同一张 spec 表，前后端同一份校验与组装） ---

// 单字段取值是否合法（前端红框判断与服务端 validateCustomInput 第 3 步共用同一实现）
export function isFieldValid(
  field: InputSpec,
  value: number,
  config: CustomProductConfig,
): boolean {
  if (field.fromWidthOptions) {
    return config.widthOptions.some((option) => Number(option.value) === value);
  }
  if (!field.limit) return true;
  const min = config.limits[`min${capitalize(field.limit)}`];
  const max = config.limits[`max${capitalize(field.limit)}`];
  return value >= min && value <= max;
}

// 范围校验错误消息（与前端表单一致的报错文案）
export function fieldErrorMessage(
  field: InputSpec,
  config: CustomProductConfig,
): string {
  if (field.fromWidthOptions) {
    return `Invalid ${field.label.toLowerCase()}`;
  }
  const min = config.limits[`min${capitalize(field.limit!)}`];
  const max = config.limits[`max${capitalize(field.limit!)}`];
  return `${field.label} must be between ${min} and ${max}${field.unit}`;
}

// number 字段的合法范围（前端输入框 min/max 提示）
export function fieldBounds(
  field: InputSpec,
  config: CustomProductConfig,
): {min: number; max: number} {
  return {
    min: field.limit ? config.limits[`min${capitalize(field.limit)}`] : 0,
    max: field.limit ? config.limits[`max${capitalize(field.limit)}`] : Infinity,
  };
}

// 进表单初始值 map：radio 字段取 widthOptions[0]，number 字段取 config.initial[initKey]
export function getInitialFieldValues(
  formType: FormType,
  config: CustomProductConfig,
): Record<FormInputField, number> {
  const values = {} as Record<FormInputField, number>;
  for (const field of getSpec(formType).inputs) {
    values[field.field] = field.fromWidthOptions
      ? Number(config.widthOptions[0].value)
      : config.initial[field.initKey ?? 'length'];
  }
  return values;
}

// 组装 CalculationInput（判别联合）：路由从 formData 收口后与前端 PriceDisplay 共用此口
// —— 表单申报什么尺寸，前后端就按同一份入参算价、校验、组行属性
export function assembleCalculationInput(
  formType: FormType,
  config: CustomProductConfig,
  values: Record<FormInputField, number>,
  precision: string,
  quantity: number,
): CalculationInput {
  switch (formType) {
    case 'Sheet':
      return {
        formType: 'Sheet',
        thickness: config.thickness, density: config.density,
        lengthMm: values.lengthMm, widthMm: values.widthMm,
        precision, quantity, unitPrice: config.unitPrice,
      };
    case 'Rod':
      return {
        formType: 'Rod',
        diameter: config.diameter, density: config.density,
        lengthMm: values.lengthMm,
        precision, quantity, unitPrice: config.unitPrice,
      };
    case 'Film':
      return {
        formType: 'Film',
        thickness: config.thickness, density: config.density,
        lengthM: values.lengthM, widthMm: values.widthMm,
        quantity, unitPrice: config.unitPrice,
      };
    case 'Flexible Rod':
      return {
        formType: 'Flexible Rod',
        diameter: config.diameter, density: config.density,
        lengthM: values.lengthM,
        quantity, unitPrice: config.unitPrice,
      };
    case 'Gasket':
      return {
        formType: 'Gasket',
        thickness: config.thickness, density: config.density,
        innerDiameterMm: values.innerDiameterMm,
        outerDiameterMm: values.outerDiameterMm,
        quantity, unitPrice: config.unitPrice,
      };
    case 'Disc':
      return {
        formType: 'Disc',
        thickness: config.thickness, density: config.density,
        diameterMm: values.diameterMm,
        quantity, unitPrice: config.unitPrice,
      };
  }
}

// 购物车行属性组装（服务端生成，客户端不可伪造；单位制只影响显示）：
// 固定参数 → 逐字段尺寸（公制只显示基准；英制基准在前括注换算值）→ Precision
export function buildLineAttributes(
  props: CalculationInput,
  unitSystem: UnitSystem,
): Array<{key: string; value: string}> {
  const spec = getSpec(props.formType);
  const attributes: Array<{key: string; value: string}> = [];

  if (spec.fixedAttribute) {
    attributes.push({
      key: spec.fixedAttribute.label,
      value: fixedValue(props, spec.fixedAttribute.field),
    });
  }
  for (const field of spec.inputs) {
    attributes.push({
      key: field.label,
      value: formatDimension(
        fieldValue(props, field.field),
        field.unit,
        unitSystem,
      ),
    });
  }
  if (spec.precision) {
    attributes.push({key: 'Precision', value: precisionOf(props)});
  }
  return attributes;
}

// 统一算价管道（六个旧计算函数的公共骨架收敛于此）：
// 体积（几何差异在 spec.volume）→ 单件重（体积 × 密度，最小 0.001kg）→ 计费基准
// （spec.billWeight，Disc / Gasket 按外切方板，缺省 = 实际重量）→ 材料费
// → 精度费 / 超长费 / 加工费（spec 开关）→ 运费 → max(0.01, 总价)。
// 未知 formType → null（fail-closed）：调用方必须显式处理，不兜底 price '0.00'。
export function calculatePriceAndWeight(
  input: CalculationInput,
): CalculationResult | null {
  const spec = getSpec(input.formType);
  if (!spec) {
    return null;
  }

  const weight = Math.max(
    0.001,
    (spec.volume(input) * input.density) / 1_000_000,
  );
  const billedWeight = spec.billWeight?.(input) ?? weight;
  const materialCost = billedWeight * input.unitPrice;

  let price = materialCost;
  if (spec.precision) {
    price += calculatePrecisionFee(precisionOf(input), input.quantity);
  }
  if (spec.oversizeDim) {
    price += calculateOversizeFee(spec.oversizeDim(input), input.quantity);
  }
  if (spec.machining) {
    price += Math.max(
      spec.machining.minFee,
      materialCost * spec.machining.ratio,
    );
    price += calculateMachiningBaseFee(input.quantity);
  }
  price += calculateShipping(weight, input.quantity);

  return {
    price: Math.max(0.01, price).toFixed(2),
    weight: Number(weight.toFixed(3)),
  };
}
