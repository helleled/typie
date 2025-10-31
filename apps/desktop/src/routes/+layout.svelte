<script lang="ts">
  import '../app.css';

  import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
  import { confirm } from '@tauri-apps/plugin-dialog';
  import { relaunch } from '@tauri-apps/plugin-process';
  import { check } from '@tauri-apps/plugin-updater';
  import { setupThemeContext } from '@typie/ui/context';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { graphql } from '$lib/graphql';
  import { systemInfo } from '$lib/system-info';
  import { SYSTEM_INFO_QUERY } from '$lib/graphql/queries';

  let { children } = $props();

  const checkForUpdates = async () => {
    // Skip update checks in offline mode
    if ($systemInfo.offlineMode) {
      return;
    }

    const update = await check();
    if (!update) {
      return;
    }

    const result = await confirm('새로운 버전이 있어요.\n업데이트하시겠어요?', {
      kind: 'info',
      title: '업데이트 확인',
      okLabel: '지금 업데이트',
      cancelLabel: '나중에 하기',
    });

    if (!result) {
      return;
    }

    await update.downloadAndInstall();
    await relaunch();
  };

  const loadSystemInfo = async () => {
    try {
      const result = await graphql(SYSTEM_INFO_QUERY);
      systemInfo.set(result.systemInfo);
    } catch (error) {
      console.error('Failed to load system info:', error);
      // Default to offline mode if we can't fetch system info
      systemInfo.set({ offlineMode: true });
    }
  };

  onMount(async () => {
    await loadSystemInfo();
    
    onOpenUrl((urls) => {
      const url = new URL(urls[0]);
      goto(`${url.pathname}${url.search}`);
    });

    checkForUpdates();
  });

  setupThemeContext();
</script>

{@render children()}
