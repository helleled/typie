<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Redirect to dashboard for local-only mode
    goto('/website/', { replaceState: true });
  });
</script>

<!-- Authentication not needed for local-only mode - redirecting to dashboard -->
