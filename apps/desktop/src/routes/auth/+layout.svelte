<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();
</script>

<div class={css({ position: 'relative', width: '[100vw]', height: '[100vh]', paddingTop: '36px' })}>
  <div
    style:-webkit-app-region="drag"
    class={css({ position: 'fixed', top: '0', left: '0', right: '0', height: '36px' })}
    data-tauri-drag-region
  ></div>

  {@render children()}
</div>
