import {useParams, Form, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Suspense, useMemo} from 'react';
import {Link} from '~/components/Link';
import {
  IconMenu,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
} from '~/components/Icon';
import {
  type EnhancedMenu,
} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import type {RootLoader} from '~/root';
import DeskNavigation from '~/components/Header/DeskNavigation';
import Logo from '../Logo';

export function CustomMobileHeader({
    title,
    isHome,
    openCart,
    openMenu,
  }: {
    title: string;
    isHome: boolean;
    openCart: () => void;
    openMenu: () => void;
  }) {
    // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  
    const params = useParams();
  
    return (
      <header
        role="banner"
        className={`bg-brand dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader flex xl:hidden items-center h-nav sticky backdrop-blur-lg z-20 top-16 justify-between w-full leading-none gap-4 px-4 md:px-8`}
      >
        <div className="flex items-center justify-start w-full gap-4">
          <button
            onClick={openMenu}
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconMenu />
          </button>
          <Form
            method="get"
            action={params.locale ? `/${params.locale}/search` : '/search'}
            className="items-center gap-2 sm:flex"
          >
            <button
              type="submit"
              className="relative flex items-center justify-center w-8 h-8"
            >
              <IconSearch />
            </button>
            {/*<Input
              className={
                isHome
                  ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                  : 'focus:border-primary/20'
              }
              type="search"
              variant="minisearch"
              placeholder="Search"
              name="q"
            />*/}
          </Form>
        </div>
        <Logo />
        {/*<Link
          className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
          to="/"
        >
          <Heading
            className="font-bold text-center leading-none"
            as={isHome ? 'h1' : 'h2'}
          >
            {title}
          </Heading>
        </Link>*/}
  
        <div className="flex items-center justify-end w-full gap-4">
          <AccountLink className="relative flex items-center justify-center w-8 h-8" />
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </header>
    );
  }

export function CustomDesktopHeader({
    isHome,
    menu,
    openCart,
    title,
  }: {
    isHome: boolean;
    openCart: () => void;
    menu?: EnhancedMenu;
    title: string;
  }) {
    const params = useParams();
    const {y} = useWindowScroll();
    return (
      <header
        role="banner"
        className={`bg-brand text-contrast dark:text-primary shadow-darkHeader hidden h-nav xl:flex items-center sticky transition duration-300 backdrop-blur-lg z-20 top-10 justify-between w-full leading-none gap-8 px-12 py-8`}
      >
        <div className="flex gap-12">
        <Logo />
          {/* <Link className="font-bold" to="/" prefetch="intent">
            {title}
          </Link>
          <nav className="flex gap-8">
            Top level menu items 
            {(menu?.items || []).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                target={item.target}
                prefetch="intent"
                className={({isActive}) =>
                  isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
                }
              >
                {item.title}
              </Link>
            ))}
          </nav>
          */}
        </div>
        <DeskNavigation menu={menu} />
        <div className="flex items-center gap-6">
          <Form
            method="get"
            action={params.locale ? `/${params.locale}/search` : '/search'}
            className="flex items-center gap-2"
          >
            {/*<Input
              className={
                isHome
                  ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                  : 'focus:border-primary/20'
              }
              type="search"
              variant="minisearch"
              placeholder="Search"
              name="q"
            />*/}
            <button
              type="submit"
              className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
            >
              <IconSearch />
            </button>
          </Form>
          <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </header>
    );
  }
  
  function AccountLink({className}: {className?: string}) {
    const rootData = useRouteLoaderData<RootLoader>('root');
    const isLoggedIn = rootData?.isLoggedIn;
  
    return (
      <Link to="/account" className={className}>
        <Suspense fallback={<IconLogin />}>
          <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
            {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconLogin />)}
          </Await>
        </Suspense>
      </Link>
    );
  }
  
  function CartCount({
    isHome,
    openCart,
  }: {
    isHome: boolean;
    openCart: () => void;
  }) {
    const rootData = useRouteLoaderData<RootLoader>('root');
    if (!rootData) return null;
  
    return (
      <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
        <Await resolve={rootData?.cart}>
          {(cart) => (
            <Badge
              dark={isHome}
              openCart={openCart}
              count={cart?.totalQuantity || 0}
            />
          )}
        </Await>
      </Suspense>
    );
  }

  function Badge({
    openCart,
    dark,
    count,
  }: {
    count: number;
    dark: boolean;
    openCart: () => void;
  }) {
    const isHydrated = useIsHydrated();
  
    const BadgeCounter = useMemo(
      () => (
        <>
          <IconBag />
          <div
            className={`${
              dark
                ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
                : 'text-contrast bg-primary'
            } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
          >
            <span>{count || 0}</span>
          </div>
        </>
      ),
      [count, dark],
    );
  
    return isHydrated ? (
      <button
        onClick={openCart}
        className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
      >
        {BadgeCounter}
      </button>
    ) : (
      <Link
        to="/cart"
        className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
      >
        {BadgeCounter}
      </Link>
    );
  }