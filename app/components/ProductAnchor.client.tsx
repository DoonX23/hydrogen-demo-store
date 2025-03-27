import { Link } from 'react-scroll';
import { useRef } from 'react';

interface Section {
  id: string;
  title: string;
}

interface ProductAnchorProps {
  sections: Section[];
}

export default function ProductAnchor({ sections }: ProductAnchorProps) {
  const navContainerRef = useRef<HTMLDivElement>(null);
  // 修改处理函数，使活跃链接居左显示
  const handleSetActive = (to: string) => {
    // 查找当前活跃的链接元素
    const activeLink = document.getElementById(`nav-link-${to}`);
    const container = navContainerRef.current;
    
    if (activeLink && container) {
      // 计算需要滚动的位置，使活跃链接居左显示
      // 可以加一点小边距(比如10px)让它不要完全贴边
      const scrollLeft = activeLink.offsetLeft - 10;
      
      // 平滑滚动到计算出的位置
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-[110px] sm:top-[130px] md:top-[160px] lg:top-[160px] xl:top-[135px] w-full bg-white z-0 shadow-sm">
      <div className="container  mx-auto">
        <div className="overflow-x-auto " ref={navContainerRef}          
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              [data-ref="scroll-container"]::-webkit-scrollbar {
                display: none;
              }
            `
          }} />
          <nav className="flex gap-4 w-full min-w-max">
            {sections.map((section) => (
              <Link
                id={`nav-link-${section.id}`}
                key={section.id}
                to={section.id}
                spy={true}
                smooth={true}
                offset={-200}
                duration={500}
                className="cursor-pointer hover:text-highlight font-medium text-brand px-3 py-4 whitespace-nowrap relative" 
                activeClass="font-medium text-highlight border-b-4 border-highlight"
                onSetActive={handleSetActive}
              >
                {section.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}