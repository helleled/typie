<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import { NodeView, NodeViewContentEditable } from '../../lib';
  import type { NodeViewProps } from '../../lib';

  type Props = NodeViewProps;

  let { node, HTMLAttributes }: Props = $props();
</script>

<NodeView
  style={css.raw({
    marginTop: '32px',
    paddingTop: '16px',
    borderTop: '1px solid token(colors.border.subtle)',
    listStyleType: 'none',
    fontSize: '0.875em',
    color: 'text.subtle',
  })}
  as="ol"
  {...HTMLAttributes}
  data-footnote-list="true"
>
  <NodeViewContentEditable transparent />
</NodeView>
