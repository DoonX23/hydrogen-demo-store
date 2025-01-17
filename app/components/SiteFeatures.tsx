import React from 'react';
import { ArrowPathIcon, CalendarIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const features: Feature[] = [
  { name: '10-year all-inclusive warranty', description: "We'll replace it with a new one", icon: CalendarIcon },
  { name: 'Free shipping on returns', description: 'Send it back for free', icon: ArrowPathIcon },
  { name: 'Free, contactless delivery', description: 'The shipping is on us', icon: TruckIcon },
  { name: '100% Secure Checkout', description: 'PayPal / MasterCard / Visa', icon: ShieldCheckIcon },
];

export const SiteFeatures: React.FC = () => {
    return (
      <section className="container">
        <div className="mx-auto py-12">
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-100 dark:bg-brand-900">
                    <feature.icon className="h-6 w-6 text-brand-600 dark:text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{feature.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  

