// ~/components/CustomProduct/UniversalInput.tsx
// 单输入框通用尺寸输入组件：显示单位由 baseUnit + unitSystem 派生
// 草稿缓冲：打字期间原样显示（"1." 不被吞），失焦/回车才换算回写基准值
// 错误为受控 prop：由表单从「当前值 + 合法范围」渲染时现算，组件只负责显示，
// 不自存错误 state（多字段共用一个错误布尔会相互覆盖）
import {useEffect, useState} from 'react';
import {
  UNIT_RATIOS,
  convertFromBase,
  convertToBase,
  type BaseUnit,
  type UnitSystem,
} from '~/utils/units';

interface UniversalInputProps {
  name: string;              // 基准字段名（FormData 提交名，如 lengthMm）
  baseUnit: BaseUnit;        // 基准单位：'mm' | 'm'
  value: number;             // 基准值
  minValue: number;          // 基准值下限
  maxValue: number;          // 基准值上限
  unitSystem: UnitSystem;    // 全局单位制
  error: boolean;            // 是否越界（表单渲染时由值与范围派生）
  onChange: (baseValue: number) => void;
}

export function UniversalInput({
  name,
  baseUnit,
  value,
  minValue,
  maxValue,
  unitSystem,
  error,
  onChange,
}: UniversalInputProps) {
  const {unit} = UNIT_RATIOS[baseUnit][unitSystem];

  // 草稿字符串：输入期间的临时态，原样显示不换算
  const [draft, setDraft] = useState<string>(() =>
    String(convertFromBase(value, baseUnit, unitSystem)),
  );

  // 外部基准值或单位制变化时（含切档），同步草稿为换算后的显示值
  useEffect(() => {
    setDraft(String(convertFromBase(value, baseUnit, unitSystem)));
  }, [value, baseUnit, unitSystem]);

  // 失焦回写：换算回基准并同步显示；越界值也如实回写，是否报错由表单派生
  const commit = (baseValue: number) => {
    setDraft(String(convertFromBase(baseValue, baseUnit, unitSystem)));
    onChange(baseValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // 空值回退到下限（与原 UnitConverter 行为一致）
    if (inputValue === '' || inputValue === '-') {
      commit(minValue);
      return;
    }

    // 处理以点开头的情况（如 ".5"）
    if (inputValue.startsWith('.')) {
      inputValue = `0${inputValue}`;
    }

    const numValue = parseFloat(inputValue);

    // 非法输入：恢复为当前有效基准值的显示
    if (isNaN(numValue)) {
      setDraft(String(convertFromBase(value, baseUnit, unitSystem)));
      return;
    }

    commit(convertToBase(numValue, baseUnit, unitSystem));
  };

  // 回车视同失焦提交（并防止在表单内误触发整体提交）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div>
      {/* 隐藏字段提交基准值：FormData 契约只认基准（mm/m）。
          可见输入框不带 name——它显示的是当前单位制的换算值，绝不能直接提交 */}
      <input type="hidden" name={name} value={value} />

      <div className="flex items-center gap-2 max-w-xs">
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 px-2 py-2 text-sm text-black bg-blue-100 border border-blue-100 rounded dark:text-black focus:border-brand [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
          placeholder={unit}
          min={0}
          step="any"
        />
        <span className="text-sm text-black shrink-0">{unit}</span>
      </div>

      {/* 错误提示：min/max 换算成当前显示单位展示 */}
      {error && (
        <p className="text-red-500 text-sm mt-2">
          Min: {convertFromBase(minValue, baseUnit, unitSystem)} {unit}
          &nbsp;&nbsp;&nbsp;Max: {convertFromBase(maxValue, baseUnit, unitSystem)} {unit}.
          <br />
          Please enter between {convertFromBase(minValue, baseUnit, unitSystem)} {unit} -{' '}
          {convertFromBase(maxValue, baseUnit, unitSystem)} {unit} or for sizes above{' '}
          {convertFromBase(maxValue, baseUnit, unitSystem)} {unit}, please contact our{' '}
          <a
            href="/pages/contact-doonx"
            target="_BLANK"
            className="text-blue-600 underline"
          >
            sales team
          </a>
        </p>
      )}
    </div>
  );
}
