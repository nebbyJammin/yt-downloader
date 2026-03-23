<script lang="ts" module>

</script>

<script lang="ts">
    import { downloadManager } from "$lib/stores/downloadManager.svelte";
    import { cubicOut } from "svelte/easing";
    import CompletedBadge from "./badges/CompletedBadge.svelte";
    import RemoveFromQueueBadge from "./badges/RemoveFromQueueBadge.svelte";
    import VideoPreview from "./VideoPreview.svelte";
    import { fade } from "svelte/transition";

  interface QueuePreviewArgs {
    hideCompleted?: boolean
  }

  let {
    hideCompleted,
    ...props
  }: QueuePreviewArgs = $props(); 
</script>

<div class="flex flex-col overflow-y-auto pr-2">
  <!-- Historical -->
  {#each downloadManager.state.completedQueue as metadata}
    <VideoPreview metadata={metadata} Badge={CompletedBadge}/> 
  {/each}
  <!-- In progress -->
  {#if downloadManager.state.currentDownload}
    <VideoPreview metadata={downloadManager.state.currentDownload}/>
  {/if}
  <!-- Upcoming in queue -->
  {#each downloadManager.state.queue as metadata (metadata.downloadId)}
    <div in:fade={{duration:150, easing: cubicOut}}>
      <VideoPreview metadata={metadata} Badge={RemoveFromQueueBadge}/>
    </div>
  {/each}
</div>
