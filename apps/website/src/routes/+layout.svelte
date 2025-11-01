<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import Footer from './website/(landing)/Footer.svelte';
  import Header from './website/(landing)/Header.svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();

  let element: HTMLDivElement;
  let elements: NodeListOf<Element>;

  afterNavigate(() => {
    elements = document.querySelectorAll('[data-observe]');
  });

  onMount(() => {
    if (!elements) return;

    const isMobile = window.innerWidth < 1024;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (isMobile) {
              requestAnimationFrame(() => {
                entry.target.classList.add('in-view');
              });
            } else {
              entry.target.classList.add('in-view');
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: isMobile ? 0.05 : 0.1,
        rootMargin: isMobile ? '0px 0px 20px 0px' : '0px 0px 50px 0px',
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  });
</script>

<div
  class={css({
    width: 'full',
    minHeight: '[100dvh]',
    color: 'gray.900',
    backgroundColor: 'white',
    fontFamily: 'Pretendard',
    wordBreak: 'keep-all',
  })}
  data-element="root"
>
  <Header />

  <div bind:this={element} class={css({ paddingTop: '96px' })}>
    {@render children()}
  </div>

  <Footer />
</div>
