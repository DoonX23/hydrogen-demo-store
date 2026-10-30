import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loader({}: LoaderFunctionArgs) {
  await wait(250 + Math.random() * 350);
  throw new Response('Link may be expired. Try checking the URL.', {
    status: 410,
  });
}

export default function Component() {
  return null;
}
