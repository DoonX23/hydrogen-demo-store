import {useNavigate, useNavigation} from '@remix-run/react';
import {CustomVariantSelector, type CustomVariantOption} from '~/components/CustomProduct/CustomVariantSelector';
import clsx from 'clsx';

export interface MetafieldNavigatorProps {
  handle: string;
  options: any; // facets的具体类型
  variants: any; // productMetafields的具体类型
}

export function ProductMetafieldNavigator({handle, options, variants}: MetafieldNavigatorProps) {
  const OptionSelector = ({option}: {option: CustomVariantOption}) => {
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isNavigating = navigation.state !== 'idle';
    
    if (!option.values.length) {
      return null;
    }
  
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = option.values.find(v => v.value === e.target.value);
      if(!selectedValue) return;
      
      selectedValue.onSelect();
      if(selectedValue.to) {
        navigate(selectedValue.to);
      }
    };
  
    return (
      <div className="mb-4 max-w-xl">
        <label htmlFor={option.name} className="block font-medium text-sm mb-2">
          {option.name}
        </label>
        <select
          id={option.name}
          value={option.value || ''}
          onChange={handleChange}
          disabled={isNavigating}
          className={clsx(
            "w-full rounded-md border-gray-200 py-2 px-3 text-sm dark:text-black",
            isNavigating && "opacity-50 cursor-not-allowed"
          )}
        >
          <option value="" disabled>
            Select {option.name}
          </option>
          {option.values.map(({value, isAvailable, isActive}) => (
            <option 
              key={option.name + value}
              value={value}
              disabled={!isAvailable}
            >
              {value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <CustomVariantSelector
      handle={handle}
      options={options}
      variants={variants}
    >
      {({option}) => (
        <OptionSelector option={option} />
      )}
    </CustomVariantSelector>
  );
}