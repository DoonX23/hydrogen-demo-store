// ~/components/CustomProduct/UnitConverter.tsx
// 双单位尺寸输入组件（恢复自旧版双框布局，内脏换新）：
// - 框一 = 基准单位（mm/m，真值本体）；框二 = 英制（in/ft，派生计算器）
// - 换算统一走 ~/utils/units 引擎（旧版硬编码在组件内，且含 3.2808 近似值）
// - 错误为受控 prop：由表单从「当前值 + 合法范围」渲染时现算，组件不再自存 state
//   （旧版自存 + onError 回调导致多字段错误互相覆盖）
// - 隐藏字段提交基准值：两个可见框都不带 name（旧版两个框都直接提交）
// - 失焦守卫：草稿与标准显示逐字一致就不重写基准值——基准值永远不经过
//   "舍入后的显示串"往返，量化漂移从构造上不可能
import {useEffect, useState} from 'react';

import {
  IMPERIAL_RATIOS,
  inputTexts,
  imperialToBase,
  formatDimension,
  type BaseUnit,
} from '~/utils/units';

interface UnitConverterProps {
  name: string; // 基准字段名（FormData 提交名，如 lengthMm）
  baseUnit: BaseUnit; // 基准单位：'mm' | 'm'（英制换算单位由此派生 in / ft）
  maxValue: number; // 最大值（以基准单位计）
  minValue: number; // 最小值（以基准单位计）
  value: number; // 受控的基准值
  error: boolean; // 是否越界（表单渲染时由值与范围派生）
  onChange: (baseValue: number) => void;
}

export function UnitConverter({
  name,
  baseUnit,
  maxValue,
  minValue,
  value,
  error,
  onChange,
}: UnitConverterProps) {
  const unitOne = baseUnit;
  const unitTwo = IMPERIAL_RATIOS[baseUnit].unit;

  // 当前基准值的双框标准串：守卫比较 / 非法恢复与草稿写入同源，不可能不一致
  const texts = inputTexts(value, baseUnit);

  // 草稿对象（两框各一份字符串）：输入期间原样显示（"1." 不被吞），
  // 失焦/回车才换算回写基准值
  const [drafts, setDrafts] = useState(() => inputTexts(value, baseUnit));

  // 外部基准值变化时（含本组件 commit 的回环）同步两个草稿
  useEffect(() => {
    setDrafts(inputTexts(value, baseUnit));
  }, [value, baseUnit]);

  const commit = (baseValue: number) => {
    setDrafts(inputTexts(baseValue, baseUnit));
    onChange(baseValue);
  };

  // 回车视同失焦提交（并防止在表单内误触发整体提交）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  // 框一失焦：值即基准，无换算
  const handleValueOneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 空值回退到下限（旧版行为原样保留）
    if (raw === '' || raw === '-') {
      commit(minValue);
      return;
    }

    // 失焦守卫：草稿与标准显示逐字一致 = 值没变，不重写基准值
    if (raw === texts.base) return;

    const inputValue = raw.startsWith('.') ? `0${raw}` : raw;
    const numValue = parseFloat(inputValue);

    // 非法输入：恢复为当前有效基准值的显示（另一框草稿不动）
    if (isNaN(numValue)) {
      setDrafts((prev) => ({...prev, base: texts.base}));
      return;
    }

    commit(numValue);
  };

  // 框二失焦：英制输入按完整精度换算回基准（四舍五入只发生在显示层）
  const handleValueTwoBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === '' || raw === '-') {
      commit(minValue);
      return;
    }

    // 失焦守卫：同框一
    if (raw === texts.imperial) return;

    const inputValue = raw.startsWith('.') ? `0${raw}` : raw;
    const numValue = parseFloat(inputValue);

    if (isNaN(numValue)) {
      setDrafts((prev) => ({...prev, imperial: texts.imperial}));
      return;
    }

    commit(imperialToBase(numValue, baseUnit));
  };

  return (
    <div>
      {/* 隐藏字段提交基准值：FormData 契约只认基准（mm/m）。
          两个可见框都不带 name——它们显示的是换算值，绝不能直接提交 */}
      <input type="hidden" name={name} value={value} />

      <div className="flex items-center gap-2">
        {/* 第一个单位输入框（基准单位，真值本体） */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={drafts.base}
              onChange={(e) =>
                setDrafts((prev) => ({...prev, base: e.target.value}))
              }
              onBlur={handleValueOneBlur}
              onKeyDown={handleKeyDown}
              className="w-full min-w-0 px-2 py-2 text-sm text-black bg-blue-100 border border-blue-100 rounded dark:text-black focus:border-brand [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
              placeholder={unitOne}
              min={0}
              step="any"
            />
            <span className="text-sm text-black shrink-0">{unitOne}</span>
          </div>
        </div>

        {/* 第二个单位输入框（英制，派生计算器） */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={drafts.imperial}
              onChange={(e) =>
                setDrafts((prev) => ({...prev, imperial: e.target.value}))
              }
              onBlur={handleValueTwoBlur}
              onKeyDown={handleKeyDown}
              className="w-full min-w-0 px-2 py-2 text-sm text-black bg-blue-100 border border-blue-100 rounded dark:text-black focus:border-brand [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
              placeholder={unitTwo}
              min={0}
              step="any"
            />
            <span className="text-sm text-black shrink-0">{unitTwo}</span>
          </div>
        </div>
      </div>

      {/* 错误提示：min/max 双单位并注展示（错误态由表单派生，本组件只负责显示） */}
      {error && (
        <p className="text-red-500 text-sm mt-2">
          Min: {formatDimension(minValue, baseUnit)}
          &nbsp;&nbsp;&nbsp;Max: {formatDimension(maxValue, baseUnit)}.
          <br />
          Please enter between {formatDimension(minValue, baseUnit)} -{' '}
          {formatDimension(maxValue, baseUnit)} or for sizes above{' '}
          {formatDimension(maxValue, baseUnit)}, please contact our{' '}
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
