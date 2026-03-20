<script lang="ts">
    import LogoFull from "$lib/components/logo/LogoFull.svelte";
    import { downloadManager } from "$lib/stores/downloadManager.svelte";


</script>

<div class="flex flex-col items-center px-5">
  <div class="w-full max-w-600 outline outline-red-200">
    <div class="w-full flex flex-col py-10 items-center">
    {
      JSON.stringify(downloadManager.state)
    }
    </div>
    <div class="h-1000"></div>
  </div>
</div>
