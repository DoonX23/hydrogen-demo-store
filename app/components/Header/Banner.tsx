import { Link } from '~/components/Link';

export function Banner() {
  return (
    <div className="bg-highlight sticky z-50 h-16 text-white xl:h-10 top-0 xl:w-full">
      <div className="container mx-auto px-4 xl:h-full py-2 xl:py-0">
        <div className="flex flex-col items-center xl:flex-row xl:justify-center xl:h-full text-sm gap-1 xl:gap-2">
          <div>Holiday Notice: Shipping resumes Feb 25. Use code DOONX15 for 15% OFF.</div>
         {/*<Link
            to="/pages/contact-doonx"
            className="border-b border-transparent hover:border-white transition-colors"
          >
            Contact Us
          </Link>*/}
        </div>
      </div>
    </div>
  );
}
