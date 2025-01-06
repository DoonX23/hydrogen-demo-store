import {toHTML} from '@portabletext/to-html';

const htmlComponents = {
  // 块级元素
  block: {
    // 段落和标题
    normal: ({children}) => `<p class="my-4">${children}</p>`,
    h2: ({children}) => `<h2 class="text-2xl font-bold my-4">${children}</h2>`,
    h3: ({children}) => `<h3 class="text-xl font-bold my-3">${children}</h3>`,
    h4: ({children}) => `<h4 class="text-lg font-bold my-2">${children}</h4>`,
    // 引用块
    blockquote: ({children}) => `<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic">${children}</blockquote>`,
  },

  // 列表
  list: {
    // 无序列表
    bullet: ({children}) => `<ul class="list-disc ml-6 my-4">${children}</ul>`,
    // 有序列表
    number: ({children}) => `<ol class="list-decimal ml-6 my-4">${children}</ol>`,
  },

  // 文本修饰和注释
  marks: {
    // 装饰器
    strong: ({children}) => `<strong class="font-bold">${children}</strong>`,
    em: ({children}) => `<em class="italic">${children}</em>`,
    code: ({children}) => `<code class="bg-gray-100 rounded px-1 font-mono">${children}</code>`,
    underline: ({children}) => `<span class="underline">${children}</span>`,
    'strike-through': ({children}) => `<span class="line-through">${children}</span>`,

    // 注释(链接)
    link: ({children, value}) => {
      const href = value?.href || '';
      const target = href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}" ${target} class="text-blue-600 hover:underline">${children}</a>`;
    },
  },
};

export function convertToHtml(portableText) {
  if (!portableText) return '';
  return toHTML(portableText, {components: htmlComponents});
}
