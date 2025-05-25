import React from 'react';

interface StatItem {
  name?: string;
  value?: string;
}

interface StatsSectionProps {
  heading?: string;
  subheading?: string;
  stats?: StatItem[];
  // 保留 block 属性以保持向后兼容性
  block?: {
    heading?: string;
    subheading?: string;
    stats?: StatItem[];
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ 
  heading,
  subheading,
  stats,
  block 
}) => {
  // 优先使用直接传递的属性，如果没有则使用 block 中的属性
  const finalHeading = heading || block?.heading;
  const finalSubheading = subheading || block?.subheading;
  const finalStats = stats || block?.stats;

  return (
    <div className="bg-white py-10 sm:py-36">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center mx-auto mb-5 lg:mb-10">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
              {finalHeading}
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              {finalSubheading}
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {finalStats && finalStats.map((stat, stIndex) => (
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