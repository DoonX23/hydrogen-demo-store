interface RadioOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function CustomRadioGroup({ name, label, options, selectedValue, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <div key={option.id}>
            <input
              type="radio"
              id={option.id}
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={option.disabled}
              className="hidden" // 隐藏原始radio按钮
            />
            <label
              htmlFor={option.id}
              className={classNames(
                option.disabled ? 'cursor-not-allowed opacity-25' : 'cursor-pointer',
                'flex items-center justify-center rounded-md px-3 py-3 text-sm font-medium',
                'ring-1 ring-blue-200 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2',
                selectedValue === option.value 
                  ? 'bg-brand text-white hover:bg-brand/90'  // 选中状态
                  : 'bg-blue-100 text-gray-900 hover:bg-blue-200' // 未选中状态
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}