<script lang="ts">
  import type { DownloadingVideoDownloadContext } from "$lib/downloadsModel";
    import ErrorBadge from "./ErrorBadge.svelte";
    import SuccessBadge from "./SuccessBadge.svelte";

  // NOTE: This is not ideal to have this component take a bunch of props that it does not care about (probably)
  let props: DownloadingVideoDownloadContext = $props();
  let {failed} = $derived(props);
</script>

{#if failed}
  <ErrorBadge {...props}/>
{:else}
  <SuccessBadge/>
{/if}
