// ~/lib/customProduct/config.ts
// 定制产品配置解析层 —— 全站唯一的 metafield 解析点（边界解析 / 收货员模式）
// 职责：取货 → 拆包装（try/catch，后台写坏 JSON 不崩页，打日志）→ 验货（范围校验）
//   → 发放类型化配置。六个表单与 ProductDescriptionSection 只消费 config，零解析零兜底。
// 所有兜底默认值集中在下方 DEFAULTS 表：调整默认值、新增产品类型只改这一个文件。
import type {DimensionLimitation} from '~/lib/type';

export type FormType = 'Sheet' | 'Film' | 'Rod' | 'Flexible Rod' | 'Gasket' | 'Disc';

const KNOWN_FORM_TYPES: FormType[] = [
  'Sheet',
  'Film',
  'Rod',
  'Flexible Rod',
  'Gasket',
  'Disc',
];

// Film 宽度默认档位（metafield 未配置 widthOptions 时兜底；value 为模具物理真值 mm）
const DEFAULT_WIDTH_OPTIONS: NonNullable<DimensionLimitation['widthOptions']> = [
  {id: 'width450', value: '450', label: '450mm'},
  {id: 'width1370', value: '1370', label: '1370mm'},
];

// 各表单默认值集中表（原先散落六个表单的 || 兜底魔数全部收编于此，含义一目了然）
// limits 系：范围下/上限兜底；init 系：进站初始值兜底（历史上初始值与 min 兜底不同值，如实保留）
type FormDefaults = Partial<{
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  minInnerDiameter: number;
  maxInnerDiameter: number;
  minOuterDiameter: number;
  maxOuterDiameter: number;
  minDiameter: number;
  maxDiameter: number;
  initLength: number;
  initWidth: number;
  initInnerDiameter: number;
  initOuterDiameter: number;
  initDiameter: number;
}>;

const DEFAULTS: Record<FormType, FormDefaults> = {
  Sheet: {
    minLength: 10, maxLength: 1016, minWidth: 10, maxWidth: 1000,
    initLength: 50, initWidth: 50,
  },
  Rod: {
    minLength: 20, maxLength: 1016,
    initLength: 30,
  },
  Film: {
    minLength: 1, maxLength: 100,
    initLength: 1,
  },
  'Flexible Rod': {
    minLength: 0.1, maxLength: 100,
    initLength: 1,
  },
  Gasket: {
    minInnerDiameter: 1, maxInnerDiameter: 500,
    minOuterDiameter: 5, maxOuterDiameter: 1000,
    initInnerDiameter: 10, initOuterDiameter: 20,
  },
  Disc: {
    minDiameter: 10, maxDiameter: 1000,
    initDiameter: 10,
  },
};

// 归一化后的合法范围：全部为数字（该表单未用到的字段以 0 填充，无消费方）
export interface NormalizedLimits {
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  minInnerDiameter: number;
  maxInnerDiameter: number;
  minOuterDiameter: number;
  maxOuterDiameter: number;
  minDiameter: number;
  maxDiameter: number;
}

// 表单消费的完整产品配置（已解析、已兜底、已校验）
export interface CustomProductConfig {
  formType: FormType | '';        // '' = 非定制商品（容器据此不渲染表单）
  limits: NormalizedLimits;       // 合法范围（min < max 已校验）
  initial: {                      // 进站初始值（零空白态；DEFAULTS 表即标准，未配字段以 0 填充、无消费方）
    length: number;
    width: number;
    innerDiameter: number;
    outerDiameter: number;
    diameter: number;
  };
  stockSizes: string;             // 详情页 Stock Sizes 展示
  widthOptions: NonNullable<DimensionLimitation['widthOptions']>;  // Film 宽度档位（已兜底）
  density: number;                // 计算参数（数字化）
  unitPrice: number;              // 计算参数（数字化）
  thickness: string;             // 固定尺寸（原样字符串：hidden input 提交 + 计算层 parseFloat）
  diameter: string;              // 固定尺寸（同上，Rod / Flexible Rod）
  machiningPrecision: string;    // 可选精度档位（Rod / Sheet）
}

// resolveProductConfig 只读这七个 metafield 字段——最小结构接口，不再依赖生成类型：
// 产品页传 ProductQuery['product']（结构超集，天然兼容），Oxygen 加购路由与将来的
// Cart Transform Function 传自己的 metafield 视图。同一份解析层三处复用，
// 同一份范围与兜底：前端展示多少就允许多少。
export interface ProductMetafieldSource {
  form_type?: {value: string} | null;
  dimension_limitation?: {value: string} | null;
  density?: {value: string} | null;
  unit_price?: {value: string} | null;
  thickness?: {value: string} | null;
  diameter?: {value: string} | null;
  machining_precision?: {value: string} | null;
}

export function resolveProductConfig(
  product: ProductMetafieldSource,
): CustomProductConfig {
  const formTypeRaw = product.form_type?.value || '';
  const formType = (
    KNOWN_FORM_TYPES as string[]
  ).includes(formTypeRaw)
    ? (formTypeRaw as FormType)
    : '';
  const defaults: FormDefaults = formType ? DEFAULTS[formType] : {};

  // 唯一 JSON 解析点：写坏不崩页，打日志 + 空配置兜底
  const raw = parseLimits(product);

  // 归一化：逐字段应用兜底（未用字段以 0 填充，无消费方）
  const limits: NormalizedLimits = {
    minLength: raw.minLength || defaults.minLength || 0,
    maxLength: raw.maxLength || defaults.maxLength || 0,
    minWidth: raw.minWidth || defaults.minWidth || 0,
    maxWidth: raw.maxWidth || defaults.maxWidth || 0,
    minInnerDiameter: raw.minInnerDiameter || defaults.minInnerDiameter || 0,
    maxInnerDiameter: raw.maxInnerDiameter || defaults.maxInnerDiameter || 0,
    minOuterDiameter: raw.minOuterDiameter || defaults.minOuterDiameter || 0,
    maxOuterDiameter: raw.maxOuterDiameter || defaults.maxOuterDiameter || 0,
    minDiameter: raw.minDiameter || defaults.minDiameter || 0,
    maxDiameter: raw.maxDiameter || defaults.maxDiameter || 0,
  };

  // 验货：min > max 属后台配置错误，打日志留痕（否则静默带错误范围下单，无从排查）
  validateLimits(formTypeRaw, limits);

  return {
    formType,
    limits,
    initial: {
      length: defaults.initLength || 0,
      width: defaults.initWidth || 0,
      innerDiameter: defaults.initInnerDiameter || 0,
      outerDiameter: defaults.initOuterDiameter || 0,
      diameter: defaults.initDiameter || 0,
    },
    stockSizes: raw.stockSizes || '',
    widthOptions:
      raw.widthOptions && raw.widthOptions.length > 0
        ? raw.widthOptions
        : DEFAULT_WIDTH_OPTIONS,
    density: Number(product.density?.value) || 0,
    unitPrice: Number(product.unit_price?.value) || 0,
    thickness: product.thickness?.value || '',
    diameter: product.diameter?.value || '',
    machiningPrecision: product.machining_precision?.value || 'Normal (±2mm)',
  };
}

// 拆包装：dimension_limitation 唯一解析出口
function parseLimits(product: ProductMetafieldSource): DimensionLimitation {
  const value = product.dimension_limitation?.value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as DimensionLimitation;
    }
    console.error(
      '[customProductConfig] dimension_limitation 不是 JSON 对象，按空配置兜底：',
      value,
    );
    return {};
  } catch (error) {
    console.error(
      '[customProductConfig] dimension_limitation JSON 解析失败，按空配置兜底（请检查 Shopify 后台该 metafield）：',
      error,
    );
    return {};
  }
}

// 验货：逐对检查 min > max（两值都存在才有意义）
function validateLimits(formType: string, limits: NormalizedLimits) {
  const pairs: Array<[string, number, number]> = [
    ['length', limits.minLength, limits.maxLength],
    ['width', limits.minWidth, limits.maxWidth],
    ['innerDiameter', limits.minInnerDiameter, limits.maxInnerDiameter],
    ['outerDiameter', limits.minOuterDiameter, limits.maxOuterDiameter],
    ['diameter', limits.minDiameter, limits.maxDiameter],
  ];
  for (const [field, min, max] of pairs) {
    if (min > 0 && max > 0 && min > max) {
      console.error(
        `[customProductConfig] ${formType} 配置错误：${field} 的 min(${min}) > max(${max})，请检查 Shopify 后台`,
      );
    }
  }
}
