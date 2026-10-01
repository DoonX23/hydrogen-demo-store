// routes/api.custom-add-to-cart.ts
// 定制商品加购：动态建变体流程（Cart Transform Function 上线前的过渡态）。
// 信任模型：固定参数（thickness/density/unitPrice/diameter/formType）一律从产品 metafield
// 读取（服务端用与前端同一份 resolveProductConfig 重建配置），表单只提交客户的真实选择
// （尺寸/precision/quantity/instructions）——申报什么尺寸为什么尺寸付钱，参数无物可伪造。
import {data} from '@shopify/remix-oxygen';
import type {ActionFunction} from '@shopify/remix-oxygen';

import {
  calculatePriceAndWeight,
  validateCustomInput,
  buildLineAttributes,
  getSpec,
  assembleCalculationInput,
  type CalculationInput,
  type FormInputField,
} from '~/utils/calculations';
import {resolveProductConfig, type ProductMetafieldSource} from '~/lib/customProductConfig';
import type {UnitSystem} from '~/utils/units';
import {createAdminApiClient} from '@shopify/admin-api-client';

// --- 在文件最上方或 verifyTurnstile 函数上方定义接口 ---
interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

// --- 修改后的 verifyTurnstile 函数 ---
async function verifyTurnstile(token: string | null, secretKey: string, ip: string | null) {
  if (!token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip
      }),
    });

    // 【关键修改】在这里加 "as TurnstileResponse"
    const outcome = await response.json() as TurnstileResponse;
    
    // 现在 TypeScript 知道 outcome 里一定有 success 字段了
    console.log("Turnstile verify result:", outcome); 
    
    return outcome.success;
  } catch (e) {
    console.error('Turnstile verification error:', e);
    return false;
  }
}
// 提取变体创建逻辑为纯函数 (保持原样无修改)
async function createVariant(adminClient: any, { productId, price, weight, calculationProps }: {
  productId: string;
  price: string;
  weight: number;
  calculationProps: CalculationInput;
}) {
  // 生成唯一变体名
  const variantName = `${Date.now().toString(36)}${Math.random().toString(36).slice(-2)}`;
  
  const variables = {
    productId,
    variants: [{
      price,
      optionValues: [{optionName: "Title", name: variantName}],
      inventoryQuantities: {
        availableQuantity: 1000,
        locationId: "gid://shopify/Location/79990817057"
      },
      inventoryItem: {
        measurement: {
          weight: {
            value: weight,
            unit: "KILOGRAMS"
          }
        }
      },
      // 新增：metafields 字段
      metafields: [
        {
          namespace: "custom", // 命名空间，用于分组管理 metafields
          key: "product_parameters", // metafield 的唯一键名
          value: JSON.stringify(calculationProps) // 将 calculationProps 对象转换为 JSON 字符串
        }
      ]
    }]
  };

  const {data, errors} = await adminClient.request(CREATE_VARIANT_MUTATION, {
    variables
  });

  if (errors || data?.productVariantsBulkCreate?.userErrors?.length > 0) {
    throw new Error('Failed to create variant');
  }

  return data.productVariantsBulkCreate.productVariants[0].id;
}

// 校验与行属性组装已 spec 化，收进共享模块 ~/utils/calculations/formSpecs.ts：
// validateCustomInput（粗校验：全局基础项 + spec 驱动的逐字段范围/档位/precision/跨字段规则）
// buildLineAttributes（行属性：固定参数 → 逐字段尺寸 → Precision，由 spec 表驱动）
// 六种形态的差异全部收敛在 FORM_SPECS 一张表里，本路由零形态分支。

export const action: ActionFunction = async ({ request, context }) => {
  try {
    const formData = await request.formData();

    // 1. 获取前端传来的 Token
    const token = formData.get('cf-turnstile-response') as string;
    
    // 2. 获取 Secret Key (使用了新名称)
    // 记得去 Oxygen 后台把环境变量名也改成 TURNSTILE_SECRET_KEY
    // 本地开发用 Cloudflare 官方测试密钥（始终通过，与前端测试 sitekey 配套）；
    // 生产构建时 import.meta.env.DEV 被 Vite 静态替换为 false，走正式密钥并强制要求环境变量存在
    const secretKey = import.meta.env.DEV
      ? '1x0000000000000000000000000000000AA' // Cloudflare 官方测试 secretkey：Always passes
      : context.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("缺少环境变量 TURNSTILE_SECRET_KEY");
      throw new Error("Server configuration error");
    }

    // 3. 执行验证
    const clientIp = request.headers.get('CF-Connecting-IP');
    const isHuman = await verifyTurnstile(token, secretKey, clientIp);

    if (!isHuman) {
      console.warn(`[Security] 拦截了这一条机器请求，IP: ${clientIp}`);
      return data(
        { 
          status: 'error', 
          error: '验证失败，请刷新页面重试 (Turnstile Verification Failed)' 
        }, 
        { status: 403 } // 403 Forbidden: 拒绝访问
      );
    }
    
    // ==========================================
    // 🛡️ 拦截结束，下面是你原有的业务代码
    // ==========================================

    // 客户当前单位制（前端隐藏字段提交，供行属性格式化；缺失/非法一律按默认英制处理）
    const unitSystem: UnitSystem =
      formData.get('unitSystem') === 'metric' ? 'metric' : 'imperial';

    // ==========================================
    // 固定参数一律从产品 metafield 读取（与前端同一份 resolveProductConfig）：
    // 表单不再提交 thickness/density/unitPrice/diameter/formType，客户端声明通道消失
    // ==========================================
    const productId = formData.get('productId') as string;
    if (!productId?.startsWith('gid://shopify/Product/')) {
      return data(
        { status: 'error', error: 'Missing or invalid productId' },
        { status: 400 }
      );
    }

    const {product} = await context.storefront.query<{product: ProductMetafieldSource | null}>(
      PRODUCT_CONFIG_QUERY,
      {variables: {id: productId}},
    );
    if (!product) {
      return data(
        { status: 'error', error: 'Product not found' },
        { status: 400 }
      );
    }
    const config = resolveProductConfig(product);
    if (!config.formType) {
      // 无 form_type 的产品不允许走定制加购通道
      return data(
        { status: 'error', error: 'Product is not customizable' },
        { status: 400 }
      );
    }

    // 客户的真实选择仍来自表单（申报什么尺寸为什么尺寸付钱）；formType 与固定参数来自 metafield。
    // 组装已 spec 化：查卡收集本形态真实需要的字段值 → 与前端共用的 assembleCalculationInput，
    // 路由零形态分支
    const num = (key: string) => parseFloat(formData.get(key) as string) || 0;
    const quantity = parseInt(formData.get('quantity') as string);

    const spec = getSpec(config.formType);
    // Object.fromEntries 返回宽类型 { [k: string]: number }，此处键来自 spec.inputs
    // 必为 FormInputField，收窄 cast 安全
    const fieldValues = Object.fromEntries(
      spec.inputs.map((field) => [field.field, num(field.field)]),
    ) as Record<FormInputField, number>;
    const calculationProps: CalculationInput = assembleCalculationInput(
      config.formType,
      config,
      fieldValues,
      (formData.get('precision') as string) || '',
      quantity,
    );

    // ==========================================
    // 🛡️ 后端数据逻辑校验 (Input Validation)
    // 粗校验（UX 反馈，非安全权威）：spec 表驱动，范围与表单同一份 config
    // ==========================================
    const dataErrors = validateCustomInput(calculationProps, config);
    
    if (dataErrors.length > 0) {
      // 如果有错误，直接返回 400 Bad Request
      return data(
        { 
          status: 'error', 
          error: dataErrors.join(', ') // "Quantity too big, Invalid length"
        },
        { status: 400 }
      );
    }

    // 未知 formType → null（fail-closed），直接 400，不再有 price '0.00' 白送
    const result = calculatePriceAndWeight(calculationProps);
    if (!result) {
      return data(
        { status: 'error', error: 'Invalid product form type' },
        { status: 400 }
      );
    }
    const {price, weight} = result;

    const adminClient = createAdminApiClient({
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
      apiVersion: context.env.SHOPIFY_ADMIN_API_VERSION, 
      accessToken: context.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    });
    const newVariantId = await createVariant(adminClient, {
      productId: formData.get('productId') as string,
      price,
      weight,
      calculationProps
    });


    try {
      // 行属性由 spec 表驱动、服务端生成（客户端不可伪造）：
      // 固定参数 → 逐字段尺寸（公制只显示基准；英制基准在前括注换算值）→ Precision
      const lineAttributes = buildLineAttributes(calculationProps, unitSystem);

      // 添加说明信息（所有表单类型通用）
      const instructions = formData.get('instructions');
      if (instructions) {
        lineAttributes.push({
          key: 'Instructions',
          value: instructions as string
        });
      }
      const lineData = {
        merchandiseId: newVariantId,
        quantity: parseInt(formData.get('quantity') as string) || 1,
        attributes: lineAttributes
      };
      
      const cartResult = await context.cart.addLines([lineData])
        .catch(error => {
          throw error;
        });
        
      const headers = context.cart.setCartId(cartResult.cart.id);
      return data(
        {
          status: 'success',
          //variantCreation: data,
          cartOperation: cartResult
        },
        {
          headers
        }
      );
    } catch (cartError) {
      throw new Error(`Cart operation failed: ${cartError instanceof Error ? cartError.message : 'Unknown error'}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        {status: 500}
      );
    }
    return data(
      {
        status: 'error',
        error: 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      {status: 500}
    );
  }
};

// 加购时按 productId 重读 7 个 custom metafield（与产品页 PRODUCT_QUERY 同源）：
// 服务端用与前端相同的解析层重建配置，固定参数不信任任何客户端提交值
const PRODUCT_CONFIG_QUERY = `
  query ProductConfig($id: ID!) {
    product(id: $id) {
      form_type: metafield(namespace: "custom", key: "form_type") {
        value
      }
      dimension_limitation: metafield(namespace: "custom", key: "dimension_limitation") {
        value
      }
      density: metafield(namespace: "custom", key: "density") {
        value
      }
      unit_price: metafield(namespace: "custom", key: "unit_price") {
        value
      }
      thickness: metafield(namespace: "custom", key: "thickness") {
        value
      }
      diameter: metafield(namespace: "custom", key: "diameter") {
        value
      }
      machining_precision: metafield(namespace: "custom", key: "machining_precision") {
        value
      }
    }
  }
`;

const CREATE_VARIANT_MUTATION = `
  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      userErrors {
        field
        message
      }
      productVariants {
        id
        title
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;
