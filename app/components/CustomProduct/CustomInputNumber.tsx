import React, {type FC} from 'react';
import {MinusIcon, PlusIcon} from '@heroicons/react/24/solid';

export interface CustomInputNumberProps {
  className?: string;
  value: number;              // 改为必需的value
  min?: number;
  max?: number;
  onChange: (value: number) => void;  // 改为必需的onChange
  label?: string;
  desc?: string;
  name?: string;
}

const CustomInputNumber: FC<CustomInputNumberProps> = ({
  className = 'w-full',
  value,                      // 使用外部传入的value
  min = 1,
  max = 10000,
  onChange,
  label,
  desc,
  name,
}) => {
  // 处理减少按钮点击
  const handleClickDecrement = () => {
    if (min >= value) return;
    const newValue = value - 1;
    onChange(newValue);        // 直接调用onChange，不维护内部状态
  };

  // 处理增加按钮点击
  const handleClickIncrement = () => {
    if (max && max <= value) return;
    const newValue = value + 1;
    onChange(newValue);
  };

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 允许空值（用户正在删除）
    if (inputValue === '') {
      onChange(min);
      return;
    }
    
    const newValue = parseInt(inputValue, 10);
    
    // 验证是否是有效数字
    if (isNaN(newValue)) {
      return;
    }
    
    // 限制在min和max范围内
    if (newValue < min) {
      onChange(min);
    } else if (max && newValue > max) {
      onChange(max);
    } else {
      onChange(newValue);
    }
  };

  // 渲染标签
  const renderLabel = () => {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
        {desc && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
            {desc}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`custom-input-number flex items-center justify-between gap-5 ${className}`}
    >
      {label && renderLabel()}
      
      <div className="custom-input-number__content flex items-center justify-between gap-1 w-[7.5rem] sm:w-32">
        {/* 减少按钮 */}
        <button
          className="rounded flex items-center justify-center border border-brand bg-brand text-white hover:bg-brand focus:outline-none disabled:opacity-50 disabled:cursor-default"
          type="button"
          onClick={handleClickDecrement}
          disabled={min >= value}
        >
          <MinusIcon className="w-8" />
        </button>
        
        {/* 输入框 */}
        <input
          type="number"
          name={name}
          value={value}
          onChange={handleInputChange}
          className="rounded w-24 text-center bg-blue-100 border border-blue-100 focus:outline-none focus:border-brand dark:text-black" 
          min={min}
          max={max}
        />
        
        {/* 增加按钮 */}
        <button
          className="rounded flex items-center justify-center border border-brand bg-brand text-white hover:bg-brand focus:outline-none disabled:opacity-50 disabled:cursor-default"          
          type="button"
          onClick={handleClickIncrement}
          disabled={max ? max <= value : false}
        >
          <PlusIcon className="w-8" />
        </button>
      </div>
    </div>
  );
};

export default CustomInputNumber;