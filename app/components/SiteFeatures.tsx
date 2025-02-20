import React from 'react';
import { CurrencyDollarIcon, ChatBubbleBottomCenterTextIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const features: Feature[] = [
  { name: 'INSTANT', description: "cut to size prices", icon: CurrencyDollarIcon },
  { name: 'FREE DELIVERY', description: 'ships to 200+ countries', icon: TruckIcon },
  { name: 'OUTSTANDING', description: 'customer service', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'SECURE CHECKOUT', description: 'PayPal / MasterCard / Visa', icon: ShieldCheckIcon },
];

export const SiteFeatures: React.FC = () => {
    return (
      <section className="hidden sm:block bg-blue-200 dark:bg-brand">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-100 dark:bg-brand-900">
                    <feature.icon className="h-11 w-11 text-brand" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold text-brand dark:text-white">{feature.name}</h3>
                  <p className="mt-1 text-sm font-medium text-brand dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  

