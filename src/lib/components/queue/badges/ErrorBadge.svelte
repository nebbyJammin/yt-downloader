<script lang="ts">
  import type { DownloadingVideoDownloadContext } from "$lib/downloadsModel";
  import { mainTooltip } from "$lib/tooltips/mainTooltip.svelte";

  let {
    error,
    ...props
  }: DownloadingVideoDownloadContext = $props();
</script>

<div class="size-8 p-1" data-tooltip={error} use:mainTooltip={{color: 'var(--red)'}}>
  <div 
    class="size-full aspect-square mask-[url(/images/icons/exclamation.svg)] bg-red"
  ></div>
</div>
