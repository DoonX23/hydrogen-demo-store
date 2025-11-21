// ~/components/CustomProduct/DiscForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps, DimensionLimitation} from '~/lib/type';
import {UnitConverter} from './UnitConverter';
import {PriceDisplay} from './PriceDisplay';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function DiscForm({product, facets, productMetafields, onError}: CustomFormProps) {
  // 解析产品元数据
  const dimensionLimitation = product.dimension_limitation?.value
    ? JSON.parse(product.dimension_limitation.value) as DimensionLimitation
    : {};
  
  // Disc表单专属状态（移除precision）
  const [diameterMm, setDiameterMm] = useState(dimensionLimitation.minDiameter || 10);
  const [quantity, setQuantity] = useState(1);
  
  // 统一的错误状态
  const [hasError, setHasError] = useState(false);

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  return (
    <>
      {/* 价格显示 - precision传空字符串 */}
      <PriceDisplay 
        formType="Disc"
        thickness={product.thickness?.value || ''}
        diameter=""
        density={Number(product.density?.value) || 0}
        lengthMm={0}
        lengthM={0}
        widthMm={0}
        diameterMm={diameterMm}
        innerDiameterMm={0}
        outerDiameterMm={0}
        precision=""
        quantity={quantity}
        unitPrice={Number(product.unit_price?.value) || 0}
      />

      {/* 产品元数据导航 */}
      <ProductMetafieldNavigator 
        handle={product.handle}
        options={facets}
        variants={productMetafields}
      />

      {/* 隐藏字段 */}
      <input type="hidden" name="thickness" value={product.thickness?.value || ''} />
      <input type="hidden" name="density" value={product.density?.value || ''} />
      <input type="hidden" name="unitPrice" value={product.unit_price?.value || ''} />
      
      <div className="mt-6 mb-6">
        <div className="space-y-6 max-w-xl">
          {/* 直径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Diameter</label>
            <UnitConverter 
              unitOne="mm"
              unitTwo="inch"
              maxValue={dimensionLimitation.maxDiameter || 1000}
              minValue={dimensionLimitation.minDiameter || 10}
              nameOne="diameterMm"
              nameTwo="diameterInch"
              value={diameterMm}
              onChange={setDiameterMm}
              onError={setHasError}
            />
          </div>

          {/* 附加说明 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Additional Instructions
            </label>
            <textarea
              name="instructions"
              rows={2}
              className="w-full max-w-xl text-sm rounded-md border-blue-100 shadow-sm bg-blue-100 focus:border-brand"
              placeholder="Please enter any additional instructions here..."
            />
          </div>

          {/* 数量输入 */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Quantity
            </span>
            <CustomInputNumber
              name="quantity" 
              value={quantity}
              min={1}
              max={10000}
              onChange={setQuantity}
            />
          </div>
        </div>
      </div>
    </>
  );
}