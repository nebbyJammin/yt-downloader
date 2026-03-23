<script lang="ts">
    import type { VideoDownloadContext } from "$lib/downloadsModel";
    import { downloadManager } from "$lib/stores/downloadManager.svelte";

  let {
    title,
    downloadId,
    ...props
  }: VideoDownloadContext = $props();

  function onDeleteVideo(e: MouseEvent) {
    downloadManager.removeQueuedVideo(downloadId);
  }
</script>

<button 
  class="rounded-full p-px grid place-content-center hover:*:bg-red-300 hover:bg-grey-1/40 active:bg-grey-1/20 transition-colors duration-200 ease-out cursor-pointer"
  aria-label="delete {title}"
  onclick={onDeleteVideo}
>
  <div 
    class="size-8 mask-[url(/images/icons/cross.svg)] bg-grey-1 transition-colors duration-200 ease-out"
  >
  </div>
</button>
