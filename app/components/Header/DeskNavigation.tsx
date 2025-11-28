import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  type ParentEnhancedMenuItem,
  type GrandChildEnhancedMenuItem,
} from '~/lib/utils';
import {Popover, Transition, Portal} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/24/solid';
import {Fragment, useState} from 'react';
import { Link } from 'react-router';
import {MenuLink} from '~/components/MenuLink';

export default function DeskNavigation({menu}: {menu?: EnhancedMenu}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return (
    <nav className="flex items-center gap-9">
      {menu?.items.map((item) => (
        item.items?.length > 0 ? (
          <TemplatesDropdown 
            key={item.id} 
            menuData={item}
            isOpen={openMenuId === item.id}
            setIsOpen={(open) => {
              setOpenMenuId(open ? item.id : null)
            }}
          />
        ) : (
          <MenuLink 
          key={item.id}
          item={item}
          className="text-sm lg:text-base"
        />
        )
      ))}
    </nav>
  );
}

function TemplatesDropdown({
  menuData,
  isOpen, 
  setIsOpen
}: {
  menuData: ParentEnhancedMenuItem;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  // 判断是否是 "By Shape" 菜单
  const isByShapeMenu = menuData.title.toLowerCase() === 'by shape';
  // 只有 By Shape 菜单才使用左右分栏状态
  const [activeSecondLevel, setActiveSecondLevel] = useState<string | null>(
    isByShapeMenu && menuData.items?.[0]?.id ? menuData.items[0].id : null
  );

  return (
      <Popover>
        {({open, close}) => (
          <>
            <Popover.Button
              className={`
                ${isOpen ? '' : 'text-opacity-90'}
                group flex items-center rounded-md text-sm lg:text-sm font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-0`}
              onClick={() => {
                setIsOpen(!isOpen);
                // 只有 By Shape 菜单才重置状态
                if (isByShapeMenu && !isOpen && menuData.items?.[0]) {
                  setActiveSecondLevel(menuData.items[0].id);
                }
              }}
            >
              <span>{menuData.title}</span>
              <ChevronDownIcon
                className={`${isOpen ? '-rotate-180' : 'text-opacity-70'}
                  ml-1 h-4 w-4 text-base group-hover:text-opacity-80 transition ease-in-out duration-150`}
                aria-hidden="true"
              />
            </Popover.Button>

            {/* Portal to body */}
            <Portal>
              <div>
                {/* Overlay */}
                <Transition
                  show={isOpen}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Popover.Overlay 
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={() => setIsOpen(false)}
                  />
                </Transition>

                {/* Dropdown Panel */}
                <Transition
                  show={isOpen}
                  as={Fragment}  
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel 
                    static
                    className="fixed top-[calc(var(--height-nav)+2.5rem)] inset-x-0 z-50"
                  >
                    <div className="bg-white dark:bg-neutral-900 shadow-lg">
                      <div className="max-w-[1280px] mx-auto">
                        <div className="text-sm border-t border-slate-200 dark:border-slate-700 py-5 lg:py-7">
                          {/* 条件渲染：根据是否是 By Shape 使用不同布局 */}
                          {isByShapeMenu ? (
                            // By Shape 的左右分栏布局
                            <div className="flex gap-8">
                              
                              {/* 左侧：二级菜单列表 - 单列 */}
                              <div className="w-48 border-r border-slate-200 dark:border-slate-700 pr-6">
                                <ul className="space-y-1">
                                  {menuData.items?.map((item: ChildEnhancedMenuItem) => (
                                    <li key={item.id}>
                                      <button
                                        onClick={() => setActiveSecondLevel(item.id)}
                                        className={`
                                          w-full text-left px-4 py-3 rounded-lg
                                          text-sm font-semibold
                                          transition-all duration-200
                                          ${activeSecondLevel === item.id 
                                            ? 'bg-brand text-white shadow-md scale-[1.02]' 
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-brand dark:hover:text-brand hover:pl-5'
                                          }
                                        `}
                                      >
                                        {item.title}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 右侧：三级菜单内容 - 三列网格 */}
                              <div className="flex-1">
                                {menuData.items
                                  ?.filter((item: ChildEnhancedMenuItem) => item.id === activeSecondLevel)
                                  .map((item: ChildEnhancedMenuItem) => (
                                    <div key={item.id}>
                                      {/* 三级菜单项 - 3列网格，添加顶部间距 */}
                                      <ul className="grid grid-cols-3 gap-x-8 gap-y-3 mt-2">
                                        {item.items?.map((subItem: GrandChildEnhancedMenuItem) => (
                                          <li key={subItem.id}>
                                            <MenuLink
                                              item={subItem}
                                              onClose={() => setIsOpen(false)}
                                              className="font-normal text-slate-900 hover:text-highlight dark:text-slate-400 dark:hover:text-white"
                                            />
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            // 其他菜单保持原来的网格布局
                            <div className="flex-1 grid grid-cols-4 gap-6 xl:gap-8 pr-6 xl:pr-8">
                              {menuData.items?.map((item: ChildEnhancedMenuItem) => (
                                <MenuItem
                                  item={item}
                                  key={item.id}
                                  close={() => setIsOpen(false)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </div>
            </Portal>
          </>
        )}
      </Popover>
  );
}

function MenuItem({
  item,
  close
}: {
  item:ChildEnhancedMenuItem;
  close: () => void;
}) {
  return (
    <div key={item.id}>
      <MenuLink
        item={item}
        onClose={close}
        className="font-medium text-brand dark:text-neutral-200"
      />

      <ul className="grid space-y-2 mt-4">
        {item.items?.map((subItem:GrandChildEnhancedMenuItem) => (
          <li key={subItem.id}>
            <MenuLink
              item={subItem}
              onClose={close}
              className="font-normal text-slate-900 hover:text-highlight dark:text-slate-400 dark:hover:text-white"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
