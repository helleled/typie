import { Extension, mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { css } from '@typie/styled-system/css';
import { ySyncPluginKey } from 'y-prosemirror';
import { createNodeView } from '../../lib';
import FootnoteListComponent from './FootnoteListComponent.svelte';
import FootnoteReferenceComponent from './FootnoteReferenceComponent.svelte';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    footnote: {
      insertFootnote: () => ReturnType;
      removeFootnote: (id: string) => ReturnType;
      focusFootnote: (id: string) => ReturnType;
    };
  }
}

const FootnoteReference = createNodeView(FootnoteReferenceComponent, {
  name: 'footnote_reference',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-footnote-id'),
        renderHTML: ({ id }) => {
          return { 'data-footnote-id': id };
        },
      },
      number: {
        default: 1,
        parseHTML: (element) => {
          const num = element.getAttribute('data-footnote-number');
          return num ? parseInt(num, 10) : 1;
        },
        renderHTML: ({ number }) => {
          return { 'data-footnote-number': number };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote-id]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'sup',
      mergeAttributes(HTMLAttributes, {
        class: css({ 
          fontSize: '0.75em',
          lineHeight: '0',
          verticalAlign: 'super',
          cursor: 'pointer',
        }),
        'data-footnote-id': node.attrs.id,
        'data-footnote-number': node.attrs.number,
      }),
      node.attrs.number.toString(),
    ];
  },
});

const FootnoteItem = Node.create({
  name: 'footnote_item',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-footnote-id'),
        renderHTML: ({ id }) => {
          return { 'data-footnote-id': id };
        },
      },
      number: {
        default: 1,
        parseHTML: (element) => {
          const num = element.getAttribute('data-footnote-number');
          return num ? parseInt(num, 10) : 1;
        },
        renderHTML: ({ number }) => {
          return { 'data-footnote-number': number };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'li[data-footnote-id]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(HTMLAttributes, {
        class: css({ 
          display: 'flex',
          gap: '8px',
          '&::marker': { content: 'none' },
        }),
        'data-footnote-id': node.attrs.id,
        'data-footnote-number': node.attrs.number,
      }),
      ['span', { class: css({ minWidth: '24px', color: 'text.subtle' }) }, `${node.attrs.number}.`],
      ['div', { class: css({ flex: '1' }) }, 0],
    ];
  },
});

const FootnoteList = createNodeView(FootnoteListComponent, {
  name: 'footnote_list',
  group: 'block',
  content: 'footnote_item+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'ol[data-footnote-list]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ol',
      mergeAttributes(HTMLAttributes, {
        class: css({
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid token(colors.border.subtle)',
          listStyleType: 'none',
        }),
        'data-footnote-list': 'true',
      }),
      0,
    ];
  },
});

const FootnoteSyncPluginKey = new PluginKey('footnoteSync');

const FootnoteSyncPlugin = Extension.create({
  name: 'footnote_sync',
  
  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: FootnoteSyncPluginKey,
        
        appendTransaction(transactions, oldState, newState) {
          const docChanged = transactions.some((tr) => tr.docChanged);
          const ySync = transactions.find((tr) => tr.getMeta(ySyncPluginKey));
          
          if (!docChanged || ySync) {
            return;
          }

          const { tr, doc } = newState;
          let modified = false;

          // Find all footnote references and the footnote list
          const references: { node: ProseMirrorNode; pos: number; id: string }[] = [];
          const footnoteListPositions: { pos: number; node: ProseMirrorNode }[] = [];
          let footnoteListPos: number | null = null;
          let footnoteListNode: ProseMirrorNode | null = null;

          doc.descendants((node, pos) => {
            if (node.type.name === 'footnote_reference' && node.attrs.id) {
              references.push({ node, pos, id: node.attrs.id });
            } else if (node.type.name === 'footnote_list') {
              footnoteListPositions.push({ pos, node });
              if (footnoteListPos === null) {
                footnoteListPos = pos;
                footnoteListNode = node;
              }
            }
            return true;
          });

          // Remove extra footnote lists (keep only the first one)
          if (footnoteListPositions.length > 1) {
            for (let i = footnoteListPositions.length - 1; i > 0; i--) {
              tr.delete(footnoteListPositions[i].pos, footnoteListPositions[i].pos + footnoteListPositions[i].node.nodeSize);
              modified = true;
            }
          }

          if (references.length === 0) {
            // No references, remove footnote list if it exists
            if (footnoteListPos !== null && footnoteListNode !== null) {
              tr.delete(footnoteListPos, footnoteListPos + footnoteListNode.nodeSize);
              modified = true;
            }
          } else {
            // Update reference numbering based on document order
            references.forEach((ref, index) => {
              const newNumber = index + 1;
              if (ref.node.attrs.number !== newNumber) {
                tr.setNodeMarkup(ref.pos, undefined, {
                  ...ref.node.attrs,
                  number: newNumber,
                });
                modified = true;
              }
            });

            const referenceIds = references.map((r) => r.id);
            const uniqueReferenceIds = Array.from(new Set(referenceIds));

            // Create or update footnote list
            if (footnoteListPos === null) {
              // Create new footnote list at the end of the body
              const bodyNode = doc.firstChild;
              if (bodyNode && bodyNode.type.name === 'body') {
                const insertPos = bodyNode.nodeSize - 1; // Before the closing body tag
                const footnoteListType = editor.schema.nodes.footnote_list;
                const footnoteItemType = editor.schema.nodes.footnote_item;
                const paragraphType = editor.schema.nodes.paragraph;

                if (footnoteListType && footnoteItemType && paragraphType) {
                  const items = uniqueReferenceIds.map((id, index) => {
                    const paragraph = paragraphType.create(null);
                    return footnoteItemType.create({ id, number: index + 1 }, paragraph);
                  });

                  const list = footnoteListType.create(null, items);
                  tr.insert(insertPos, list);
                  modified = true;
                }
              }
            } else {
              // Update existing footnote list
              const existingItems = new Map<string, { node: ProseMirrorNode; pos: number }>();
              footnoteListNode?.forEach((child, offset, index) => {
                if (child.type.name === 'footnote_item' && child.attrs.id) {
                  existingItems.set(child.attrs.id, { 
                    node: child, 
                    pos: footnoteListPos! + offset + 1 
                  });
                }
              });

              // Remove items that don't have corresponding references
              for (const [id, { pos, node }] of existingItems.entries()) {
                if (!uniqueReferenceIds.includes(id)) {
                  tr.delete(pos, pos + node.nodeSize);
                  modified = true;
                }
              }

              // Add missing items and update numbering
              const footnoteItemType = editor.schema.nodes.footnote_item;
              const paragraphType = editor.schema.nodes.paragraph;

              uniqueReferenceIds.forEach((id, index) => {
                const newNumber = index + 1;
                const existingItem = existingItems.get(id);

                if (!existingItem) {
                  // Add new item
                  if (footnoteItemType && paragraphType) {
                    const paragraph = paragraphType.create(null);
                    const newItem = footnoteItemType.create({ id, number: newNumber }, paragraph);
                    
                    // Insert at the appropriate position in the list
                    const insertPosInList = footnoteListPos! + 1 + index;
                    tr.insert(insertPosInList, newItem);
                    modified = true;
                  }
                } else if (existingItem.node.attrs.number !== newNumber) {
                  // Update numbering
                  tr.setNodeMarkup(existingItem.pos, undefined, {
                    ...existingItem.node.attrs,
                    number: newNumber,
                  });
                  modified = true;
                }
              });
            }
          }

          if (modified) {
            tr.setMeta('addToHistory', false);
            tr.setMeta('ySync$', { origin: 'footnote-sync' });
            return tr;
          }

          return null;
        },
      }),
    ];
  },
});

export const Footnote = Extension.create({
  name: 'footnote',

  addExtensions() {
    return [
      FootnoteReference,
      FootnoteItem,
      FootnoteList,
      FootnoteSyncPlugin,
    ];
  },

  addCommands() {
    return {
      insertFootnote:
        () =>
        ({ commands, state, editor }) => {
          // Generate unique ID
          const id = `footnote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Find the highest number currently in use
          let maxNumber = 0;
          state.doc.descendants((node) => {
            if (node.type.name === 'footnote_reference') {
              maxNumber = Math.max(maxNumber, node.attrs.number || 0);
            }
          });

          const number = maxNumber + 1;

          return commands.insertContent({
            type: 'footnote_reference',
            attrs: { id, number },
          });
        },

      removeFootnote:
        (id: string) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return false;

          let removed = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'footnote_reference' && node.attrs.id === id) {
              tr.delete(pos, pos + node.nodeSize);
              removed = true;
              return false;
            }
            return true;
          });

          if (removed && dispatch) {
            dispatch(tr);
            return true;
          }

          return false;
        },

      focusFootnote:
        (id: string) =>
        ({ state, view }) => {
          let targetPos: number | null = null;

          state.doc.descendants((node, pos) => {
            if (node.type.name === 'footnote_item' && node.attrs.id === id) {
              targetPos = pos + 2; // Position inside the first paragraph
              return false;
            }
            return true;
          });

          if (targetPos !== null && view) {
            const tr = state.tr.setSelection(state.tr.doc.resolve(targetPos) as any);
            view.dispatch(tr);
            view.focus();
            return true;
          }

          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-f': () => this.editor.commands.insertFootnote(),
    };
  },
});
