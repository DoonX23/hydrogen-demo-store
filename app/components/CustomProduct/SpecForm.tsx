// ~/components/CustomProduct/SpecForm.tsx
// 六形态唯一的定制表单：外壳（价格 / 导航 / 说明 / 数量）写一遍，
// 字段区 / 精度区 / 初始值 / 联动规则全部由 FORM_SPECS 查卡驱动。
// 前后端同一张 spec 表、同一份 isFieldValid / crossValidate / assembleCalculationInput：
// 表单红框判什么，服务端就拒什么；表单申报什么尺寸，前后端就按同一份入参算价。
import {useState, useEffect} from 'react';

import type {CustomFormProps} from '~/lib/type';
import {
  getSpec,
  isFieldValid,
  fieldBounds,
  getInitialFieldValues,
  assembleCalculationInput,
  type FormType,
  type CalculationInput,
  type FormInputField,
} from '~/lib/customProduct';
import {formatDimension} from '~/utils/units';

import {CustomRadioGroup} from '../CustomRadioGroup';

import {UnitConverter} from './UnitConverter';
import {PriceDisplay} from './PriceDisplay';
import CustomInputNumber from './CustomInputNumber';
import {ProductMetafieldNavigator} from './ProductMetafieldNavigator';

export function SpecForm({
  product,
  config,
  facets,
  productMetafields,
  onError,
}: CustomFormProps) {
  // 容器只在 formType 非空时渲染本表单，此处断言非空（不用提前 return，守 hooks 规则）
  const formType = config.formType as FormType;
  // 产品配置已由解析层（resolveProductConfig）拆好验好：表单零解析、零兜底
  const spec = getSpec(formType);

  // 形态差异全部查卡取值，表单自身零分支
  const [values, setValues] = useState<Record<FormInputField, number>>(() =>
    getInitialFieldValues(formType, config),
  );
  // 精度初始值：Rod 查卡取产品 machiningPrecision（历史行为），其余固定 Normal
  const [precision, setPrecision] = useState(
    spec.precisionInitial === 'config'
      ? config.machiningPrecision
      : 'Normal (±2mm)',
  );
  // 初始数量：Gasket=10 为历史行为原样保留，缺省 1
  const [quantity, setQuantity] = useState(spec.defaultQuantity ?? 1);

  // 前后端同一份入参组装：喂 PriceDisplay 与校验，与服务端路由同源
  const calculationInput: CalculationInput = assembleCalculationInput(
    formType,
    config,
    values,
    precision,
    quantity,
  );

  // 错误为派生值：由当前值与合法范围现算（不存 state，多字段互不覆盖）
  const fieldErrors = new Map(
    spec.inputs
      .map(
        (field) =>
          [
            field.field,
            !isFieldValid(field, values[field.field], config),
          ] as const,
      )
      .filter(([, invalid]) => invalid),
  );
  // 跨字段规则（Gasket 内径 < 外径）：服务端校验同一份文案
  const crossErrors = spec.crossValidate?.(calculationInput, config) ?? [];
  const hasError = fieldErrors.size > 0 || crossErrors.length > 0;

  // 通知父组件错误状态
  useEffect(() => {
    onError(hasError);
  }, [hasError, onError]);

  // 加工精度选项（仅收精度费的形态渲染；产品只配 Normal 时禁 High）
  const precisionOptions = [
    {id: 'Normal', value: 'Normal (±2mm)', label: 'Normal (±2mm)'},
    {
      id: 'High',
      value: 'High (±0.2mm)',
      label: 'High (±0.2mm)',
      disabled: config.machiningPrecision === 'Normal (±2mm)',
    },
  ];

  return (
    <>
      {/* 价格显示（与服务端算价管道同一份入参） */}
      <PriceDisplay {...calculationInput} />

      {/* 产品元数据导航 */}
      <ProductMetafieldNavigator
        handle={product.handle}
        options={facets}
        variants={productMetafields}
      />

      {/* 固定参数（thickness/density/unitPrice）不再提交：服务端直接读产品 metafield */}

      <div className="mt-6 mb-6">
        <div className="space-y-6 max-w-xl">
          {/* 字段区：spec.inputs 顺序即渲染顺序（Film 宽度在前）；
              尺寸输入为双单位并排（基准框 + 英制换算框），无需单位制切换 */}
          {spec.inputs.map((field) => {
            const {min, max} = fieldBounds(field, config);
            if (field.widget === 'radio') {
              // 档位字段（Film 宽度）：radio label 双单位并注（模具物理真值 mm 原样保留）
              const options = config.widthOptions.map((option) => ({
                ...option,
                label: formatDimension(Number(option.value), 'mm'),
              }));
              return (
                <CustomRadioGroup
                  key={field.field}
                  name={field.field}
                  label={field.label}
                  options={options}
                  selectedValue={String(values[field.field])}
                  onChange={(value) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.field]: Number(value),
                    }))
                  }
                />
              );
            }
            return (
              <div key={field.field} className="space-y-2">
                <label className="block text-sm font-medium">
                  {field.label}
                </label>
                <UnitConverter
                  name={field.field}
                  baseUnit={field.unit}
                  maxValue={max}
                  minValue={min}
                  value={values[field.field]}
                  error={fieldErrors.has(field.field)}
                  onChange={(baseValue) =>
                    setValues((prev) => ({...prev, [field.field]: baseValue}))
                  }
                />
                {/* 跨字段规则提示（Gasket 内外径） */}
                {crossErrors.length > 0 &&
                  field.field === spec.inputs[spec.inputs.length - 1].field &&
                  crossErrors.map((message) => (
                    <p key={message} className="text-sm text-red-600">
                      {message}
                    </p>
                  ))}
              </div>
            );
          })}

          {/* 加工精度选择（仅收精度费的形态：Sheet / Rod） */}
          {spec.precision && (
            <CustomRadioGroup
              name="precision"
              label="Machining Precision"
              options={precisionOptions}
              selectedValue={precision}
              onChange={setPrecision}
            />
          )}

          {/* 附加说明 */}
          <div className="space-y-2">
            <label htmlFor="instructions" className="block text-sm font-medium">
              Additional Instructions
            </label>
            <textarea
              name="instructions"
              id="instructions"
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
