import React from 'react';

interface StatItem {
  name?: string;
  value?: string;
}

interface StatsSectionProps {
  block?: {
    heading?: string;
    subheading?: string;
    stats?: StatItem[];
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ block }) => {
  return (
    <div className="bg-white py-10 sm:py-36">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center mx-auto mb-5 lg:mb-10">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
              {block?.heading}
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              {block?.subheading}
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {block?.stats && block.stats.map((stat, stIndex) => (
              <div
                key={stIndex}
                className="flex flex-col bg-gray-400/5 p-8"
              >
                <dt className="text-sm/6 font-semibold text-gray-600">
                  {stat.name}
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;