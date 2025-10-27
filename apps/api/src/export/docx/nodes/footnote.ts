import { Paragraph, TextRun } from 'docx';
import { convertInlineContentToTextRuns, convertParagraph } from './paragraph';
import type { JSONContent } from '@tiptap/core';
import type { ConvertOptions } from '../types';

export function convertFootnoteList(node: JSONContent, options: ConvertOptions): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Add separator line
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: '───────────────────────────────────────', color: 'CCCCCC' })],
      spacing: { before: 400, after: 200 },
    }),
  );

  // Convert each footnote item
  if (node.content) {
    for (const item of node.content) {
      if (item.type === 'footnote_item') {
        paragraphs.push(...convertFootnoteItem(item, options));
      }
    }
  }

  return paragraphs;
}

export function convertFootnoteItem(node: JSONContent, options: ConvertOptions): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const number = node.attrs?.number || 1;

  // Create prefix for the first paragraph
  const prefix = new TextRun({
    text: `${number}. `,
    superScript: false,
    size: 18, // 9pt (half-points)
  });

  if (node.content && node.content.length > 0) {
    // First paragraph with number prefix
    const firstParagraph = node.content[0];
    if (firstParagraph.type === 'paragraph') {
      paragraphs.push(convertParagraph(firstParagraph, options, { prefix, spacing: { before: 100, after: 100 } }));
    }

    // Remaining paragraphs without prefix
    for (let i = 1; i < node.content.length; i++) {
      const paragraph = node.content[i];
      if (paragraph.type === 'paragraph') {
        paragraphs.push(convertParagraph(paragraph, options, { spacing: { before: 100, after: 100 } }));
      }
    }
  }

  return paragraphs;
}

export function createFootnoteReference(id: string, number: number): TextRun {
  return new TextRun({
    text: number.toString(),
    superScript: true,
    size: 18, // 9pt (half-points)
  });
}
