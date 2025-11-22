// ~/components/CustomProduct/GasketForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps, DimensionLimitation} from '~/lib/type';
import {UnitConverter} from './UnitConverter';
import {PriceDisplay} from './PriceDisplay';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function GasketForm({product, facets, productMetafields, onError}: CustomFormProps) {
  // 解析产品元数据
  const dimensionLimitation = product.dimension_limitation?.value
    ? JSON.parse(product.dimension_limitation.value) as DimensionLimitation
    : {};
  
  // Gasket表单专属状态
  // 内径 (Inner Diameter)
  const [innerDiameterMm, setInnerDiameterMm] = useState(
    dimensionLimitation.minInnerDiameter || 10
  );
  
  // 外径 (Outer Diameter)
  const [outerDiameterMm, setOuterDiameterMm] = useState(
    dimensionLimitation.minOuterDiameter || 20
  );
  
  const [quantity, setQuantity] = useState(10);
  
  // 统一的错误状态
  const [hasError, setHasError] = useState(false);

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  // 验证外径必须大于内径
  useEffect(() => {
    if (outerDiameterMm <= innerDiameterMm) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [innerDiameterMm, outerDiameterMm]);

  return (
    <>
      {/* 价格显示 */}
      <PriceDisplay 
        formType="Gasket"
        thickness={product.thickness?.value || ''}
        diameter=""
        density={Number(product.density?.value) || 0}
        lengthMm={0}
        lengthM={0}
        widthMm={0}
        innerDiameterMm={innerDiameterMm}  // 新增参数
        outerDiameterMm={outerDiameterMm}  // 新增参数
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
          {/* 内径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Inner Diameter</label>
            <UnitConverter 
              unitOne="mm"
              unitTwo="inch"
              maxValue={dimensionLimitation.maxInnerDiameter || 500}
              minValue={dimensionLimitation.minInnerDiameter || 1}
              nameOne="innerDiameterMm"
              nameTwo="innerDiameterInch"
              value={innerDiameterMm}
              onChange={setInnerDiameterMm}
              onError={setHasError}
            />
          </div>

          {/* 外径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Outer Diameter</label>
            <UnitConverter 
              unitOne="mm"
              unitTwo="inch"
              maxValue={dimensionLimitation.maxOuterDiameter || 1000}
              minValue={dimensionLimitation.minOuterDiameter || 5}
              nameOne="outerDiameterMm"
              nameTwo="outerDiameterInch"
              value={outerDiameterMm}
              onChange={setOuterDiameterMm}
              onError={setHasError}
            />
            {/* 验证提示 */}
            {outerDiameterMm <= innerDiameterMm && (
              <p className="text-sm text-red-600">
                Outer diameter must be greater than inner diameter
              </p>
            )}
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