import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  type ParentEnhancedMenuItem,
  type GrandChildEnhancedMenuItem,
} from '~/lib/utils';
import {Popover, Transition, Portal} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/24/solid';
import {Fragment, useState} from 'react';
import {Link} from '@remix-run/react';
import {MenuLink} from '~/components/MenuLink';

export default function DeskNavigation({menu}: {menu?: EnhancedMenu}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return (
    <nav className="flex items-center gap-8">
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
  return (
      <Popover>
        {({open, close}) => (
          <>
            <Popover.Button
              className={`
                ${isOpen ? '' : 'text-opacity-90'}
                group flex items-center rounded-md text-sm lg:text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-0`}
              onClick={() => setIsOpen(!isOpen)} 
            >
              <span>{menuData.title}</span>
              <ChevronDownIcon
                className={`${isOpen ? '-rotate-180' : 'text-opacity-70'}
                  ml-2 h-4 w-4 text-base group-hover:text-opacity-80 transition ease-in-out duration-150`}
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
                        <div className="flex text-sm border-t border-slate-200 dark:border-slate-700 py-10 lg:py-14">
                          <div className="flex-1 grid grid-cols-4 gap-6 xl:gap-8 pr-6 xl:pr-8">
                            {menuData.items?.map((item:ChildEnhancedMenuItem) => (
                              <MenuItem
                                item={item}
                                key={item.id}
                                close={() => setIsOpen(false)}
                              />
                            ))}
                          </div>
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
        className="font-medium text-slate-900 dark:text-neutral-200"
      />

      <ul className="grid space-y-4 mt-4">
        {item.items?.map((subItem:GrandChildEnhancedMenuItem) => (
          <li key={subItem.id}>
            <MenuLink
              item={subItem}
              onClose={close}
              className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
