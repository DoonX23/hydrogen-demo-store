// ~/components/CustomProduct/DiscForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps} from '~/lib/type';
import {UniversalInput} from './UniversalInput';
import {UnitSystemSwitch} from './UnitSystemSwitch';
import {PriceDisplay} from './PriceDisplay';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function DiscForm({product, config, facets, productMetafields, onError, unitSystem, onUnitSystemChange}: CustomFormProps) {
  // 产品配置已由解析层（resolveProductConfig）拆好验好：表单零解析、零兜底
  const {limits, initial} = config;

  // Disc表单专属状态（移除precision）
  const [diameterMm, setDiameterMm] = useState(initial.diameter);
  const [quantity, setQuantity] = useState(1);

  // 错误为派生值：由当前值与合法范围现算（不存 state，多字段互不覆盖）
  const diameterError = diameterMm < limits.minDiameter || diameterMm > limits.maxDiameter;
  const hasError = diameterError;

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  return (
    <>
      {/* 价格显示 */}
      <PriceDisplay
        formType="Disc"
        thickness={config.thickness}
        density={config.density}
        diameterMm={diameterMm}
        quantity={quantity}
        unitPrice={config.unitPrice}
      />

      {/* 产品元数据导航 */}
      <ProductMetafieldNavigator 
        handle={product.handle}
        options={facets}
        variants={productMetafields}
      />

      {/* 固定参数（thickness/density/unitPrice）不再提交：服务端直接读产品 metafield */}
      
      <div className="mt-6 mb-6">
        <div className="space-y-6 max-w-xl">
          {/* 单位制切换（紧贴尺寸输入区顶部，切档只改显示不碰基准值） */}
          <UnitSystemSwitch baseUnit="mm" unitSystem={unitSystem} onChange={onUnitSystemChange} />

          {/* 直径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Diameter</label>
            <UniversalInput
              name="diameterMm"
              baseUnit="mm"
              maxValue={limits.maxDiameter}
              minValue={limits.minDiameter}
              value={diameterMm}
              unitSystem={unitSystem}
              error={diameterError}
              onChange={setDiameterMm}
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