// ~/components/CustomProduct/SheetForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps, DimensionLimitation} from '~/lib/type';
import {UnitConverter} from './UnitConverter';
import {PriceDisplay} from './PriceDisplay';
import {CustomRadioGroup} from '../CustomRadioGroup';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function SheetForm({product, facets, productMetafields, onError}: CustomFormProps) {
  // 解析产品元数据
  const dimensionLimitation = product.dimension_limitation?.value
    ? JSON.parse(product.dimension_limitation.value) as DimensionLimitation
    : {};
  
  const machiningPrecision = product.machining_precision?.value || 'Normal (±2mm)';
  
  // Sheet表单专属状态
  const [lengthMm, setLengthMm] = useState(dimensionLimitation.minLength || 10);
  const [widthMm, setWidthMm] = useState(dimensionLimitation.minWidth || 10);
  const [precision, setPrecision] = useState('Normal (±2mm)');
  const [quantity, setQuantity] = useState(1);
  
  // 统一的错误状态
  const [hasError, setHasError] = useState(false);

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  // 加工精度选项
  const precisionOptions = [
    { id: 'Normal', value: 'Normal (±2mm)', label: 'Normal (±2mm)' },
    { 
      id: 'High', 
      value: 'High (±0.2mm)', 
      label: 'High (±0.2mm)',
      disabled: machiningPrecision === 'Normal (±2mm)'
    },
  ];

  return (
    <>
      {/* 价格显示 */}
      <PriceDisplay 
        formType="Sheet"
        thickness={product.thickness?.value || ''}
        diameter=""
        density={Number(product.density?.value) || 0}
        lengthMm={lengthMm}
        lengthM={0}
        widthMm={widthMm}
        precision={precision}
        quantity={quantity}
        unitPrice={Number(product.unit_price?.value) || 0}
      />

      {/* 产品元数据导航 */}
      <ProductMetafieldNavigator 
        handle={product.handle}
        options={facets}
        variants={productMetafields}
      />

      {/* 隐藏字段 - 通过FormData提交 */}
      <input type="hidden" name="thickness" value={product.thickness?.value || ''} />
      <input type="hidden" name="density" value={product.density?.value || ''} />
      <input type="hidden" name="unitPrice" value={product.unit_price?.value || ''} />
      
      <div className="mt-6 mb-6">
        <div className="space-y-6 max-w-xl">
          {/* 长度输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Length</label>
            <UnitConverter 
              unitOne="mm"
              unitTwo="inch"
              maxValue={dimensionLimitation.maxLength || 1016}
              minValue={dimensionLimitation.minLength || 10}
              nameOne="lengthMm"
              nameTwo="lengthInch"
              value={lengthMm}
              onChange={setLengthMm}
              onError={setHasError}
            />
          </div>

          {/* 宽度输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Width</label>
            <UnitConverter 
              unitOne="mm"
              unitTwo="inch"
              maxValue={dimensionLimitation.maxWidth || 1000}
              minValue={dimensionLimitation.minWidth || 10}
              nameOne="widthMm"
              nameTwo="widthInch"
              value={widthMm}
              onChange={setWidthMm}
              onError={setHasError}
            />
          </div>

          {/* 加工精度选择 */}
          <CustomRadioGroup
            name="precision"
            label="Machining Precision"
            options={precisionOptions}
            selectedValue={precision}
            onChange={setPrecision}
          />

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