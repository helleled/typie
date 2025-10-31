<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import type { Editor } from '@tiptap/core';
  import type { PageLayout } from '@typie/ui/utils';

  type Props = {
    editor: Editor;
    pageLayout: PageLayout | null;
    children: any;
  };

  let { editor, pageLayout, children }: Props = $props();
</script>

<div class={css({ 
  position: 'absolute', 
  inset: '0', 
  pointerEvents: 'none',
  zIndex: '1'
})}>
  {@render children()}
</div>