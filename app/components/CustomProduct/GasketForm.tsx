// ~/components/CustomProduct/GasketForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps} from '~/lib/type';
import {UniversalInput} from './UniversalInput';
import {UnitSystemSwitch} from './UnitSystemSwitch';
import {PriceDisplay} from './PriceDisplay';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function GasketForm({product, config, facets, productMetafields, onError, unitSystem, onUnitSystemChange}: CustomFormProps) {
  // 产品配置已由解析层（resolveProductConfig）拆好验好：表单零解析、零兜底
  const {limits, initial} = config;

  // Gasket表单专属状态
  // 内径 (Inner Diameter)
  const [innerDiameterMm, setInnerDiameterMm] = useState(initial.innerDiameter);

  // 外径 (Outer Diameter)
  const [outerDiameterMm, setOuterDiameterMm] = useState(initial.outerDiameter);

  const [quantity, setQuantity] = useState(10);

  // 错误为派生值：由当前值现算（不存 state，多字段互不覆盖）
  // 含交叉校验：外径必须大于内径
  const innerError = innerDiameterMm < limits.minInnerDiameter || innerDiameterMm > limits.maxInnerDiameter;
  const outerError = outerDiameterMm < limits.minOuterDiameter || outerDiameterMm > limits.maxOuterDiameter;
  const crossError = outerDiameterMm <= innerDiameterMm;
  const hasError = innerError || outerError || crossError;

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  return (
    <>
      {/* 价格显示 */}
      <PriceDisplay
        formType="Gasket"
        thickness={config.thickness}
        density={config.density}
        innerDiameterMm={innerDiameterMm}
        outerDiameterMm={outerDiameterMm}
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

          {/* 内径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Inner Diameter</label>
            <UniversalInput
              name="innerDiameterMm"
              baseUnit="mm"
              maxValue={limits.maxInnerDiameter}
              minValue={limits.minInnerDiameter}
              value={innerDiameterMm}
              unitSystem={unitSystem}
              error={innerError}
              onChange={setInnerDiameterMm}
            />
          </div>

          {/* 外径输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Outer Diameter</label>
            <UniversalInput
              name="outerDiameterMm"
              baseUnit="mm"
              maxValue={limits.maxOuterDiameter}
              minValue={limits.minOuterDiameter}
              value={outerDiameterMm}
              unitSystem={unitSystem}
              error={outerError}
              onChange={setOuterDiameterMm}
            />
            {/* 验证提示 */}
            {crossError && (
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