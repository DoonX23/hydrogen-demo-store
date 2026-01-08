import { useFetcher, useOutletContext } from 'react-router';
import { useEffect, useRef } from 'react';

export function useAutoOpenCartOnAdd() {
  const fetcher = useFetcher();
  const { openCart } = useOutletContext<{ openCart: () => void }>();
  
  // 用来记录上一次处理过的数据引用，而不是简单的 true/false
  const lastProcessedDataRef = useRef<any>(null);

  useEffect(() => {
    // 核心逻辑：只有当 data 引用发生变化，且 data 存在时才执行
    // 这样避免了 fetcher.data 没变（仅仅是组件重渲染）导致的重复触发
    if (fetcher.data && fetcher.data !== lastProcessedDataRef.current) {
      
      // 更新记录
      lastProcessedDataRef.current = fetcher.data;

      // 判断业务逻辑
      if (fetcher.data.status === 'success') {
        openCart();
      }
    }
  }, [fetcher.data, openCart]); // 依赖项只需这两个

  return fetcher;
}