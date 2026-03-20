<script lang="ts">
  import { globalPersistentStore } from '$lib/stores/globalPersistentStore.svelte';
  import { downloadManager } from '$lib/stores/downloadManager.svelte';
  import { onMount, type Snippet } from 'svelte';

  let {children}: {children?: Snippet} = $props();

  onMount(() => {
    globalPersistentStore.init()
    downloadManager.init();
  })
</script>

{@render children?.()}
