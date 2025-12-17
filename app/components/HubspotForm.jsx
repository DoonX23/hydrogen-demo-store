import {Disclosure} from '@headlessui/react';
import {useState, useEffect, useRef} from 'react';
import {ChevronUpIcon} from '@heroicons/react/20/solid'

export function HubspotForm({buttonText = "Get Your Quote"}) { // 将函数名改为英文
  const [loadScript, setLoadScript] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formContainerRef = useRef(null);
  const disclosureRef = useRef(null);
  
  useEffect(() => {
    if (loadScript) {
      const existingIframe = formContainerRef.current?.querySelector('iframe');
      if (existingIframe) {
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = "https://js.hsforms.net/forms/embed/v2.js";
      script.async = true;
      script.onload = () => {
        window.hbspt.forms.create({
          portalId: "21243260", 
          formId: "4a112389-a712-487f-8a20-81b18b697748",
          target: "#hubspot-form-container",
          onFormReady: () => {
            setIsLoading(false);
          },
        });
      };
      document.body.appendChild(script);
    }
  }, [loadScript]);

  return (
      <Disclosure ref={disclosureRef}>
        {({open}) => (
          <>
            <Disclosure.Button 
              className={`
                flex w-full justify-between px-4 py-3 text-white font-semibold rounded hover:text-white
                
                ${open ? 'bg-highlight text-white' : 'bg-gradient-to-r from-brand to-highlight hover:bg-highlight'}
              `}
              onMouseEnter={() => setLoadScript(true)}
              onClick={() => {
                setLoadScript(true);
                disclosureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span>{buttonText}</span>
              <ChevronUpIcon
                className={`${
                  open ? 'rotate-180 transform' : ''
                } h-5 w-5`}
              />
            </Disclosure.Button>
            
            <div className={`${open ? 'block' : 'hidden'}`}>
              {isLoading && loadScript && (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              )}
              <div 
                id="hubspot-form-container" 
                ref={formContainerRef}
                className={`${isLoading ? 'hidden' : ''} p-6 bg-gray-100`} // 增加内边距和背景色
              >
              </div>
            </div>
          </>
        )}
      </Disclosure>
  );
}