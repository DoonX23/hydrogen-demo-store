import {useEffect, useState} from 'react';

// 单位转换函数
const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === 'mm' && toUnit === 'inch') return value / 25.4;
  if (fromUnit === 'inch' && toUnit === 'mm') return value * 25.4;
  if (fromUnit === 'm' && toUnit === 'ft') return value * 3.2808;
  if (fromUnit === 'ft' && toUnit === 'm') return value / 3.2808;
  return value;
};

// 格式化数字
const formatNumber = (num: number): string => {
  return Number(num.toFixed(3)).toString();
};

interface UnitConverterProps {
  unitOne: string;           // 第一个单位（主单位）
  unitTwo: string;           // 第二个单位
  maxValue: number;          // 最大值（以unitOne为单位）
  minValue: number;          // 最小值（以unitOne为单位）
  nameOne: string;           // 第一个输入框的name
  nameTwo: string;           // 第二个输入框的name
  value: number;             // 受控的值（以unitOne为单位）
  onChange: (value: number) => void;  // 值变化回调
  onError: (hasError: boolean) => void;  // 错误状态回调
}

export function UnitConverter({
  unitOne,
  unitTwo,
  maxValue,
  minValue,
  nameOne, 
  nameTwo,
  value,
  onChange,
  onError,
}: UnitConverterProps) {
  // 本地输入状态（用于处理输入中的临时状态，如 "1."）
  const [inputOne, setInputOne] = useState<string>(formatNumber(value));
  const [inputTwo, setInputTwo] = useState<string>(
    formatNumber(convertUnits(value, unitOne, unitTwo))
  );
  
  // 错误状态
  const [hasError, setHasError] = useState<boolean>(false);

  // 当外部value变化时，同步更新本地输入状态
  useEffect(() => {
    setInputOne(formatNumber(value));
    setInputTwo(formatNumber(convertUnits(value, unitOne, unitTwo)));
  }, [value, unitOne, unitTwo]);

  // 检查是否超出范围
  const checkError = (numValue: number): boolean => {
    return numValue < minValue || numValue > maxValue;
  };

  // 处理第一个输入框变化（输入过程中）
  const handleValueOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputOne(inputValue);  // 允许输入过程中的任何值（包括 "1."）
  };

  // 处理第二个输入框变化（输入过程中）
  const handleValueTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputTwo(inputValue);
  };

  // 处理第一个输入框失去焦点（完成输入）
  const handleValueOneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // 处理空值
    if (inputValue === '' || inputValue === '-') {
      const newValue = minValue;
      setInputOne(formatNumber(newValue));
      setInputTwo(formatNumber(convertUnits(newValue, unitOne, unitTwo)));
      setHasError(false);
      onError(false);
      onChange(newValue);
      return;
    }
    
    // 处理以点开头的情况（如 ".5"）
    if (inputValue.startsWith('.')) {
      inputValue = `0${inputValue}`;
    }
    
    const numValue = parseFloat(inputValue);
    
    // 检查是否是有效数字
    if (isNaN(numValue)) {
      // 恢复到当前有效值
      setInputOne(formatNumber(value));
      setInputTwo(formatNumber(convertUnits(value, unitOne, unitTwo)));
      return;
    }
    
    // 检查错误
    const isError = checkError(numValue);
    setHasError(isError);
    onError(isError);
    
    // 更新显示值
    setInputOne(formatNumber(numValue));
    const converted = convertUnits(numValue, unitOne, unitTwo);
    setInputTwo(formatNumber(converted));
    
    // 通知父组件值的变化
    onChange(numValue);
  };

  // 处理第二个输入框失去焦点（完成输入）
  const handleValueTwoBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // 处理空值
    if (inputValue === '' || inputValue === '-') {
      const newValue = minValue;
      const convertedValue = convertUnits(newValue, unitOne, unitTwo);
      setInputOne(formatNumber(newValue));
      setInputTwo(formatNumber(convertedValue));
      setHasError(false);
      onError(false);
      onChange(newValue);
      return;
    }
    
    // 处理以点开头的情况
    if (inputValue.startsWith('.')) {
      inputValue = `0${inputValue}`;
    }
    
    const numValue = parseFloat(inputValue);
    
    // 检查是否是有效数字
    if (isNaN(numValue)) {
      // 恢复到当前有效值
      setInputOne(formatNumber(value));
      setInputTwo(formatNumber(convertUnits(value, unitOne, unitTwo)));
      return;
    }
    
    // 转换为第一个单位的值
    const convertedToOne = convertUnits(numValue, unitTwo, unitOne);
    
    // 检查错误
    const isError = checkError(convertedToOne);
    setHasError(isError);
    onError(isError);
    
    // 更新显示值
    setInputTwo(formatNumber(numValue));
    setInputOne(formatNumber(convertedToOne));
    
    // 通知父组件值的变化
    onChange(convertedToOne);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* 第一个单位输入框 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="number"
              name={nameOne}
              value={inputOne}
              onChange={handleValueOneChange}
              onBlur={handleValueOneBlur}
              className="w-full min-w-0 px-2 py-2 text-sm text-black bg-blue-100 border border-blue-100 rounded dark:text-black focus:border-brand"
              placeholder={`${unitOne}`}
              min={minValue}
              step="any"
            />
            <span className="text-sm text-black shrink-0">{unitOne}</span>
          </div>
        </div>
        
        {/* 第二个单位输入框 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="number"
              name={nameTwo}
              value={inputTwo}
              onChange={handleValueTwoChange}
              onBlur={handleValueTwoBlur}
              className="w-full min-w-0 px-2 py-2 text-sm text-black bg-blue-100 border border-blue-100 rounded dark:text-black focus:border-brand"
              placeholder={`${unitTwo}`}
              min={0}
              step="any"
            />
            <span className="text-sm text-black shrink-0">{unitTwo}</span>
          </div>
        </div>
      </div>
      
      {/* 错误提示 */}
      {hasError && (
        <p className="text-red-500 text-sm mt-2">
          Min: {minValue} {unitOne}&nbsp;&nbsp;&nbsp;Max: {maxValue} {unitOne}.
          <br />
          Please enter between {minValue} {unitOne} - {maxValue} {unitOne} or for sizes above {maxValue} {unitOne}, please contact our {' '}
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