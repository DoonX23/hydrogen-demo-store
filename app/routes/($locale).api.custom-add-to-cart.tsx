// routes/api.create-variant.ts
import {data} from '@shopify/remix-oxygen';
import type {ActionFunction} from '@shopify/remix-oxygen';
import {calculatePriceAndWeight, type CalculationProps} from '~/utils/calculations';
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
  calculationProps: CalculationProps;
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

// --- 修复后的校验函数 ---
function validateData(props: CalculationProps) {
  const errors: string[] = [];
  
  // 1. 全局基础校验
  if (isNaN(props.quantity) || props.quantity < 1) {
    errors.push("Quantity must be at least 1");
  }
  if (props.quantity > 10000) { 
    errors.push("Quantity cannot exceed 10000"); 
  }
  if (props.unitPrice < 0) {
     errors.push("Invalid price");
  }

  const MAX_DIMENSION_MM = 3000; 
  const MIN_DIMENSION_MM = 1;

  // 2. 根据 formType 进行针对性校验
  switch (props.formType) {
    case 'Sheet':
      // 修复核心：使用 (props.lengthMm ?? 0)
      if ((props.lengthMm ?? 0) < MIN_DIMENSION_MM || (props.lengthMm ?? 0) > MAX_DIMENSION_MM) {
        errors.push(`Length must be between ${MIN_DIMENSION_MM} and ${MAX_DIMENSION_MM}mm`);
      }
      if ((props.widthMm ?? 0) < MIN_DIMENSION_MM || (props.widthMm ?? 0) > MAX_DIMENSION_MM) {
        errors.push(`Width must be between ${MIN_DIMENSION_MM} and ${MAX_DIMENSION_MM}mm`);
      }
      if (!props.thickness) errors.push("Thickness is required");
      break;

    case 'Rod':
      if ((props.lengthMm ?? 0) < MIN_DIMENSION_MM || (props.lengthMm ?? 0) > MAX_DIMENSION_MM) {
        errors.push(`Length must be between ${MIN_DIMENSION_MM} and ${MAX_DIMENSION_MM}mm`);
      }
      if (!props.diameter) errors.push("Diameter is required");
      break;
      
    case 'Film':
    case 'Flexible Rod':
       // 处理 lengthM 可能为 undefined 的情况
       if ((props.lengthM ?? 0) <= 0 || (props.lengthM ?? 0) > 1000) { 
         errors.push("Invalid length (Meters)");
       }
       break;

    case 'Gasket':
       // 处理内径外径
       const inner = props.innerDiameterMm ?? 0;
       const outer = props.outerDiameterMm ?? 0;
       
       if (inner <= 0 || outer <= 0) {
           errors.push("Invalid diameter dimensions");
       }
       if (inner >= outer) {
           errors.push("Inner diameter must be smaller than outer diameter");
       }
       break;
    
    case 'Disc':
       if ((props.diameterMm ?? 0) <= 0) {
           errors.push("Invalid diameter");
       }
       break;

    default:
      errors.push("Invalid product form type");
  }

  return errors;
}

export const action: ActionFunction = async ({ request, context }) => {
  try {
    const formData = await request.formData();

    // 1. 获取前端传来的 Token
    const token = formData.get('cf-turnstile-response') as string;
    
    // 2. 获取 Secret Key (使用了新名称)
    // 记得去 Oxygen 后台把环境变量名也改成 TURNSTILE_SECRET_KEY
    const secretKey = context.env.TURNSTILE_SECRET_KEY; 

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

    const calculationProps: CalculationProps = {
      formType: formData.get('formType') as string,
      thickness: formData.get('thickness') as string,
      diameter: formData.get('diameter') as string,
      density: parseFloat(formData.get('density') as string),
      lengthM: parseFloat(formData.get('lengthM') as string) || 0,
      lengthMm: parseFloat(formData.get('lengthMm') as string) || 0,
      widthMm: parseFloat(formData.get('widthMm') as string) || 0,
      diameterMm: parseFloat(formData.get('diameterMm') as string) || 0,
      innerDiameterMm: parseFloat(formData.get('innerDiameterMm') as string) || 0,
      outerDiameterMm: parseFloat(formData.get('outerDiameterMm') as string) || 0,
      precision: formData.get('precision') as string || '',
      quantity: parseInt(formData.get('quantity') as string),
      unitPrice: parseFloat(formData.get('unitPrice') as string)
    };

    // ==========================================
    // 🛡️ 新增：后端数据逻辑校验 (Input Validation)
    // ==========================================
    const dataErrors = validateData(calculationProps);
    
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

    const {price, weight} = calculatePriceAndWeight(calculationProps);

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
      const lineAttributes = [];
      
      // 修改：按产品特征分类处理属性
      // 1. 厚度类产品 (Thickness-based)
      switch (calculationProps.formType) {
        case 'Sheet':
          lineAttributes.push(
            {key: 'Thickness', value: `${calculationProps.thickness}`},
            {key: 'Length', value: `${formData.get('lengthMm')}mm (${formData.get('lengthInch')}")`},
            {key: 'Width', value: `${calculationProps.widthMm}mm (${formData.get('widthInch')}")`},
            {key: 'Precision', value: calculationProps.precision}
          );
          break;
          
        case 'Film':
          lineAttributes.push(
            {key: 'Thickness', value: `${calculationProps.thickness}`},
            {key: 'Length', value: `${formData.get('lengthM')}m (${formData.get('lengthFt')}ft)`},
            {key: 'Width', value: `${calculationProps.widthMm}mm (${formData.get('widthInch')}")`}
          );
          break;
          
        // 2. 直径类产品 (Diameter-based)
        case 'Rod':
          lineAttributes.push(
            {key: 'Diameter', value: `${calculationProps.diameter}`},
            {key: 'Length', value: `${formData.get('lengthMm')}mm (${formData.get('lengthInch')}")`}
          );
          break;
          
        case 'Flexible Rod':
          lineAttributes.push(
            {key: 'Diameter', value: `${calculationProps.diameter}`},
            {key: 'Length', value: `${formData.get('lengthM')}m (${formData.get('lengthFt')}ft)`}
          );
          break;
          
        // 3. 圆形类产品 (Circular-based)
        case 'Gasket':
          lineAttributes.push(
            {key: 'Thickness', value: `${calculationProps.thickness}`},
            {key: 'Inner Diameter', value: `${calculationProps.innerDiameterMm}mm (${formData.get('innerDiameterInch')}")`},
            {key: 'Outer Diameter', value: `${calculationProps.outerDiameterMm}mm (${formData.get('outerDiameterInch')}")`}
          );
          break;
          
        case 'Disc':
          lineAttributes.push(
            {key: 'Thickness', value: `${calculationProps.thickness}`},
            {key: 'Diameter', value: `${calculationProps.diameterMm}mm (${formData.get('diameterInch')}")`}
          );
          break;
      }
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
