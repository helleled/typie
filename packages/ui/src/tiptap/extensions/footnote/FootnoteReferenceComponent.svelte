<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import { NodeView } from '../../lib';
  import type { NodeViewProps } from '../../lib';

  type Props = NodeViewProps;

  let { node, HTMLAttributes, editor }: Props = $props();

  let attrs = $state(node.attrs);
  $effect(() => {
    attrs = node.attrs;
  });

  const handleClick = () => {
    if (editor && attrs.id) {
      editor.commands.focusFootnote(attrs.id);
    }
  };
</script>

<NodeView
  style={css.raw({
    fontSize: '0.75em',
    lineHeight: '0',
    verticalAlign: 'super',
    cursor: 'pointer',
    color: 'accent.brand.default',
    fontWeight: 'medium',
    _hover: {
      textDecoration: 'underline',
    },
  })}
  as="sup"
  {...HTMLAttributes}
  onclick={handleClick}
>
  {attrs.number}
</NodeView>
