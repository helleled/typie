<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Redirect directly to dashboard for local-only mode
    goto('/website/', { replaceState: true });
  });
</script>

<!-- Empty page - will redirect to dashboard immediately -->
