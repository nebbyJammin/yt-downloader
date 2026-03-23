<script lang="ts" module>
  let hideCompleted = $state(false);
</script>

<script lang="ts">

  import { downloadManager } from "$lib/stores/downloadManager.svelte";
  import QueuePreview from "./QueuePreview.svelte";

  let isConsuming = $derived(downloadManager.state.consumingFromQueue)
  let abortStartText = $derived.by(() => {
    if (isConsuming) {
      return "Abort Download"
    } else {
      return "Start Downloading"
    }
  });

  let abortStartOnClick = $derived.by(() => {
    if (downloadManager.queueEmpty()) return;

    if (isConsuming) {
      return async () => {
        await downloadManager.stopConsumingDownloadQueue();
      }
    } else {
      return async () => {
        await downloadManager.startConsumingDownloadQueue();
      }
    }
  })

  function clearQueueOnClick() {
    if (isConsuming) {
      return;
    }

    downloadManager.clearQueue();
  }

</script>

{#snippet QueueControls()}
  <div class="grid grid-cols-[1fr_auto] gap-x-5">
    <div class="flex flex-wrap gap-2">
      <button 
        class="interactable-purple px-6 py-3 rounded-lg font-bold whitespace-nowrap basis-0 grow max-w-50"
        onclick={abortStartOnClick}
      >{abortStartText}</button> 
      <button 
        class="interactable-purple px-6 py-3 rounded-lg font-bold whitespace-nowrap basis-0 grow max-w-50 disabled:bg-grey-1"
        onclick={clearQueueOnClick}
        disabled={isConsuming}
      >Clear Queue</button> 
    </div>
    <div class="flex items-center gap-x-2">
      <label for="hide-completed">Hide Completed:</label>
      <input type="checkbox" class="size-6" bind:checked={hideCompleted}>
    </div>
  </div>  
{/snippet}

<div class="h-full flex flex-col gap-y-10">
  {@render QueueControls()}
  <QueuePreview/>
</div>


