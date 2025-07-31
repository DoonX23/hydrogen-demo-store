import React from 'react';
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export interface ListItem {
  text?: string;
  highlighted?: boolean;
}

interface ListItemsProps {
  list?: ListItem[];
}

const ListItems: React.FC<ListItemsProps> = ({ list }) => {
  if (!list || list.length === 0) return null;
  
  return (
    <ul className="mt-4 space-y-2">
      {list.map((item, idx) => (
        <li 
          key={idx} 
          className={`flex items-start gap-x-2 text-sm ${item.highlighted ? 'font-medium text-brand' : 'text-gray-600'}`}
        >
          {/* 修改：使用ArrowRightIcon，颜色为highlight */}
          <ChevronRightIcon className="h-5 w-5 flex-none text-brand" aria-hidden="true" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
};

export default ListItems;