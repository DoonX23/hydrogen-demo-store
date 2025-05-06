import {Disclosure} from '@headlessui/react';
import {Suspense} from 'react';
import {Heading} from '~/components/Text';
import {IconCaret} from '~/components/Icon';
import {
  type EnhancedMenu,
  type GrandChildEnhancedMenuItem,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {MenuLink} from '~/components/MenuLink';

function CustomMobileHeaderMenu({menu, onClose}: {menu?: EnhancedMenu, onClose: () => void}) {
    return (
      <>
        {(menu?.items || []).map((item) => (
          <section key={item.id} className="grid">
            {item?.items?.length > 0 ? (
            // 有子菜单时显示Disclosure
            <Disclosure>
              {({open}) => (
                <>
                  <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between items-center text-xl" size="lead" as="h3">
                      {item.title}
                      {item?.items?.length > 0 && (
                        <span className="md:hidden">
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </span>
                      )}
                    </Heading>
                  </Disclosure.Button>
                    <div
                      className={`${
                        open ? `h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                    >
                      <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                        <Disclosure.Panel static>
                          <nav className="grid gap-2 pt-4 pl-2">
                            {item.items.map((subItem: ChildEnhancedMenuItem) => (
                              <div key={subItem.id} className="">
                                {subItem.items?.length > 0 ? (
                                  <Disclosure>
                                    {({open: subOpen}) => (
                                      <>
                                        <Disclosure.Button className="text-left md:cursor-default">
                                          <div className="flex justify-between items-center text-lg font-medium">
                                            {subItem.title}
                                            <span className="md:hidden">
                                              <IconCaret direction={subOpen ? 'up' : 'down'} />
                                            </span>
                                          </div>
                                        </Disclosure.Button>
                                        <div
                                          className={`${
                                            subOpen ? `h-fit` : `max-h-0 md:max-h-fit`
                                          } overflow-hidden transition-all duration-300`}
                                        >
                                          <nav className="grid gap-3 pl-2 pt-3">
                                            {subItem.items.map((grandChild: GrandChildEnhancedMenuItem) => (
                                              <MenuLink  // 这里改为MenuLink
                                                key={grandChild.id}
                                                item={grandChild}
                                                onClose={onClose}
                                              />
                                            ))}
                                          </nav>
                                        </div>
                                      </>
                                    )}
                                  </Disclosure>
                                ) : (
                                  <MenuLink 
                                    item={subItem} 
                                    onClose={onClose} 
                                    className="text-lg font-medium"
                                  />
                                )}
                              </div>
                            ))}
                          </nav>
                        </Disclosure.Panel>
                      </Suspense>
                    </div>
                </>
              )}
            </Disclosure>
          ) : (
              // 没有子菜单时显示可点击的MenuLink
              <MenuLink
                item={item}
                onClose={onClose}
                className="text-xl"
              />
            )}
          </section>
        ))}
      </>
    );
  }
  // 3. CustomMenuMobileNav保持不变
export function CustomMenuMobileNav({
    menu,
    onClose,
  }: {
    menu: EnhancedMenu;
    onClose: () => void;
  }) {
    return (
      <nav className="grid gap-6 p-6 sm:gap-6 sm:px-12 sm:py-8 overflow-y-auto max-h-screen">
        <CustomMobileHeaderMenu menu={menu} onClose={onClose} />
      </nav>
    );
  }