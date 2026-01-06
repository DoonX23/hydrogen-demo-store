// routes/api.create-variant.ts
import {data} from '@shopify/remix-oxygen';
import type {ActionFunction} from '@shopify/remix-oxygen';
import {calculatePriceAndWeight, type CalculationProps} from '~/utils/calculations';
import {createAdminApiClient} from '@shopify/admin-api-client';

// 提取变体创建逻辑为纯函数
async function createVariant(adminClient: any, {productId, price, weight, calculationProps}: {
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


export const action: ActionFunction = async ({request, context}) => {
  try {
    const formData = await request.formData();

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
