import { Fragment } from 'react';

interface ProductSpecificationsProps {
  specifications: Record<string, any[]>;
  className?: string;
  title?: string;
  description?: string;
}
function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
  }
export default function ProductSpecifications({
  specifications,
  className = '',
  title = 'Specifications',
  description = 'Detailed technical parameters for product quality assurance'
}: ProductSpecificationsProps) {
  return (
    <div id="specifications" className={`pb-8 scroll-mt-24 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-3">
                      PROPERTIES
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      VALUE
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      UNIT
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      PARAMETER
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      NORM
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {Object.entries(specifications).map(([type, properties]) => (
                    <Fragment key={type}>
                      <tr className="border-t border-gray-200">
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="bg-gray-50 py-2 pr-3 pl-4 text-left text-sm font-semibold text-highlight sm:pl-3"
                        >
                          {type}
                        </th>
                      </tr>
                      {properties.map((property, propertyIdx) => (
                        <tr
                          key={property.name}
                          className={classNames(
                            propertyIdx === 0 ? 'border-gray-300' : 'border-gray-200',
                            'border-t'
                          )}
                        >
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3">
                            {property.name}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                            {property.value}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                            {property.unit}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                            {property.parameter}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                            {property.norm}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[30px]" />
    </div>
  );
}