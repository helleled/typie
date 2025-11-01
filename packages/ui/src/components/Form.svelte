<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import { flex } from '@typie/styled-system/patterns';

  type Props = {
    onSubmit?: (e: Event) => void;
    class?: string;
    children: any;
  };

  let { onSubmit, class: className, children }: Props = $props();
</script>

<form 
  class={css({ display: 'flex', flexDirection: 'column' }) + ' ' + (className || '')}
  onsubmit={onSubmit}
>
  {@render children()}
</form>