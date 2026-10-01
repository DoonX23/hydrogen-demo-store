// ~/components/CustomProduct/FilmForm.tsx
import {useState, useEffect} from 'react';
import type {CustomFormProps} from '~/lib/type';
import {UniversalInput} from './UniversalInput';
import {formatDimension} from '~/utils/units';
import {PriceDisplay} from './PriceDisplay';
import {CustomRadioGroup} from '../CustomRadioGroup';
import {UnitSystemSwitch} from './UnitSystemSwitch';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function FilmForm({product, config, facets, productMetafields, onError, unitSystem, onUnitSystemChange}: CustomFormProps) {
  // 产品配置已由解析层（resolveProductConfig）拆好验好：表单零解析、零兜底
  const {limits, initial} = config;

  // Radio label 随单位制动态生成（宽度 value 为模具物理真值 mm，绝不圆整；档位兜底在解析层完成）：
  // 公制 `450mm`；英制 `450mm (17.72")`
  const widthDisplayOptions = config.widthOptions.map((option) => ({
    ...option,
    label: formatDimension(Number(option.value), 'mm', unitSystem),
  }));

  // Film表单专属状态
  const [widthMm, setWidthMm] = useState(Number(config.widthOptions[0].value));
  const [lengthM, setLengthM] = useState(initial.length);
  const [quantity, setQuantity] = useState(1);

  // 错误为派生值：由当前值与合法范围现算（不存 state，多字段互不覆盖）
  const lengthError = lengthM < limits.minLength || lengthM > limits.maxLength;
  const hasError = lengthError;

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  return (
    <>
      {/* 价格显示 */}
      <PriceDisplay
        formType="Film"
        thickness={config.thickness}
        density={config.density}
        lengthM={lengthM}
        widthMm={widthMm}
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
          <UnitSystemSwitch baseUnit="m" unitSystem={unitSystem} onChange={onUnitSystemChange} />

          {/* 宽度选择（单选） */}
          <CustomRadioGroup
            name="widthMm"
            label="Width"
            options={widthDisplayOptions}
            selectedValue={widthMm.toString()}
            onChange={(value) => setWidthMm(Number(value))}
          />

          {/* 长度输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Length</label>
            <UniversalInput
              name="lengthM"
              baseUnit="m"
              maxValue={limits.maxLength}
              minValue={limits.minLength}
              value={lengthM}
              unitSystem={unitSystem}
              error={lengthError}
              onChange={setLengthM}
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