import type { TextSerializer } from '@tiptap/core';

export const textSerializers: Record<string, TextSerializer> = {
  page_break: () => '\n',
  hard_break: () => '\n',
  code_block: () => '',
  html_block: () => '',
  footnote_reference: ({ node }) => `[${node.attrs.number}]`,
  footnote_item: ({ node }) => `[${node.attrs.number}] `,
  footnote_list: () => '\n\n',
};
