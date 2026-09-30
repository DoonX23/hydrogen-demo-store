// ~/components/CustomProduct/UnitSystemSwitch.tsx
// 单位制切换：直接复用 CustomRadioGroup 渲染为两档单选，紧贴各表单尺寸输入区顶部
// 标签随表单基准单位派生（mm 系显示 in|mm，m 系显示 ft|m），永远等于页面上实际的单位后缀
// radio 自带 name="unitSystem"，选中档随 FormData 提交，替代容器层的隐藏字段
import {CustomRadioGroup} from '../CustomRadioGroup';
import {UNIT_RATIOS, type BaseUnit, type UnitSystem} from '~/utils/units';

interface UnitSystemSwitchProps {
  baseUnit: BaseUnit;       // 本表单尺寸字段的基准单位，决定两档标签显示什么
  unitSystem: UnitSystem;
  onChange: (unitSystem: UnitSystem) => void;
}

export function UnitSystemSwitch({baseUnit, unitSystem, onChange}: UnitSystemSwitchProps) {
  const options = [
    {id: 'unitSystem-imperial', value: 'imperial', label: UNIT_RATIOS[baseUnit].imperial.unit},
    {id: 'unitSystem-metric', value: 'metric', label: UNIT_RATIOS[baseUnit].metric.unit},
  ];

  return (
    <CustomRadioGroup
      name="unitSystem"
      label="Unit"
      options={options}
      selectedValue={unitSystem}
      onChange={(value) => onChange(value as UnitSystem)}
    />
  );
}
