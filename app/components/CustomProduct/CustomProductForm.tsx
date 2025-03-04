import type {ProductQuery} from 'storefrontapi.generated';
import {useEffect, useState} from 'react';
import {useFetcher} from '@remix-run/react';
import {UnitConverter} from '~/components/CustomProduct/UnitConverter';
import CustomInputNumber from '~/components/CustomProduct/CustomInputNumber';
import {PriceDisplay} from '~/components/CustomProduct/PriceDisplay';
import {Button} from '~/components/Button';
import { CustomRadioGroup } from '~/components/CustomRadioGroup';
import {ProductMetafieldNavigator, type MetafieldNavigatorProps} from '~/components/CustomProduct/ProductMetafieldNavigator';

interface ApiResponse {
  status: 'success' | 'error';
  error?: string;
  variantCreation?: any;
  cartOperation?: any;
  timestamp?: string;
}
interface CustomProductFormProps {
  product: ProductQuery['product'];
  facets: MetafieldNavigatorProps['options'];
  productMetafields: MetafieldNavigatorProps['variants'];
}
export function CustomProductForm({product, facets, productMetafields}: CustomProductFormProps) {
  if (!product?.id) {
    throw new Response('product', {status: 404});
  }
  
  const fetcher = useFetcher<ApiResponse>();

  const collection = product.collections.nodes[0];
  
  const formType = product.form_type?.value || '';
  const machiningPrecision = product.machining_precision?.value || 'Normal (±2mm)';
  
  const [hasError, setHasError] = useState(false);
  const [lengthMm, setLengthMm] = useState(1);
  const [lengthM, setLengthM] = useState(1);
  const [widthMm, setWidthMm] = useState(formType === 'Film' ? 450 : 1);
  const [quantity, setQuantity] = useState(1);
  const [precision, setPrecision] = useState('Normal (±2mm)');
  useEffect(() => {
    if (fetcher.data?.status === 'success') {
        console.error('添加成功');
    } else if (fetcher.data?.error) {
      console.error('添加失败:', fetcher.data.error);
    }
  }, [fetcher.data]);
  const handlePrecisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrecision(e.target.value);
  };

    // 对于Width选择
  const widthOptions = [
    { id: 'width450', value: '450', label: '450mm' },
    { id: 'width1370', value: '1370', label: '1370mm' },
  ];

    // 对于Machining Precision选择
  const precisionOptions = [
    { id: 'Normal', value: 'Normal (±2mm)', label: 'Normal (±2mm)' },
    { 
      id: 'High', 
      value: 'High (±0.2mm)', 
      label: 'High (±0.2mm)',
      disabled: machiningPrecision === 'Normal (±2mm)'
    },
  ];

  return (
    <div className="w-full mx-auto">
      <PriceDisplay 
              formType={formType}
              thickness={product.thickness?.value || ''}
              diameter={product.diameter?.value || ''}
              density={Number(product.density?.value) || 0}
              lengthMm={lengthMm}
              lengthM={lengthM}
              widthMm={widthMm}
              precision={precision}
              quantity={quantity}
              unitPrice={Number(product.unit_price?.value) || 0}
        />
      <ProductMetafieldNavigator 
        handle={product.handle}
        options={facets}
        variants={productMetafields}
      />
      <fetcher.Form action="/api/custom-add-to-cart" method="post">
        <input type="hidden" name="productId" value={product.id || ''} />
        <input type="hidden" name="formType" value={formType} />
        <input type="hidden" name="material" value={product.material?.value || ''} />
        <input type="hidden" name="opacity" value={product.opacity?.value || ''} />
        <input type="hidden" name="color" value={product.color?.value || ''} />
        <input type="hidden" name="thickness" value={product.thickness?.value || ''} />
        <input type="hidden" name="diameter" value={product.diameter?.value || ''} />
        <input type="hidden" name="density" value={product.density?.value || ''} />
        <input type="hidden" name="unitPrice" value={product.unit_price?.value || ''} />
        <div className="mt-6 mb-6">
          <div className="space-y-6 max-w-xl">
            {formType === 'Film' ? (
              <>
                <CustomRadioGroup
                  name="widthMm"
                  label="Width"
                  options={widthOptions}
                  selectedValue={widthMm.toString()}
                  onChange={(value) => setWidthMm(Number(value))}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Length</label>
                  <UnitConverter 
                    unitOne="m"
                    unitTwo="yard"
                    maxValue={100}
                    minValue={1}
                    nameOne="lengthM"
                    nameTwo="lengthYard"
                    onError={setHasError}
                    onValueChange={setLengthM}
                  />
                </div>
              </>
            ) : formType === 'Rod' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Length</label>
                <UnitConverter 
                  unitOne="mm"
                  unitTwo="inch"
                  maxValue={1000}
                  minValue={1}
                  nameOne="lengthMm"
                  nameTwo="lengthInch"
                  onError={setHasError}
                  onValueChange={setLengthMm}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Length</label>
                  <UnitConverter 
                    unitOne="mm"
                    unitTwo="inch"
                    maxValue={600}
                    minValue={1}
                    nameOne="lengthMm"
                    nameTwo="lengthInch"
                    onError={setHasError}
                    onValueChange={setLengthMm}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Width</label>
                  <UnitConverter 
                    unitOne="mm"
                    unitTwo="inch"
                    maxValue={600}
                    minValue={1}
                    nameOne="widthMm"
                    nameTwo="widthInch"
                    onError={setHasError}
                    onValueChange={setWidthMm}
                  />
                </div>
              </>
            )}
            {formType !== 'Film' && (
              <CustomRadioGroup
                name="precision"
                label="Machining Precision"
                options={precisionOptions}
                selectedValue={precision}
                onChange={setPrecision}
              />
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Additional Instructions
              </label>
              <textarea
                name="instructions"
                rows={4}
                className="w-full max-w-xl rounded-md border-blue-100 shadow-sm bg-blue-100 focus:border-brand"
                placeholder="Please enter any additional instructions here..."
              />
            </div>
            <div className="flex flex-col gap-4">
              {/* 数量选择 */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Quantity
                </span>
                <CustomInputNumber
                  name="quantity" 
                  defaultValue={1}
                  min={1}
                  max={10000}
                  onChange={(value) => setQuantity(value)}
                />
              </div>
              {/* 加购按钮 - 注意保留flex-1和h-full */}
              <div className="grid items-stretch gap-4">
                <Button
                  type="submit"
                  disabled={fetcher.state !== 'idle' || hasError}
                >
                  <span>
                    {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </fetcher.Form>
    </div>
  );
}