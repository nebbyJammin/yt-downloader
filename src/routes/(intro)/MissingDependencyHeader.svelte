<script lang="ts">
  const {
    name, missing
  }: {name: string, missing: Promise<boolean>} = $props();
</script>

<h3 class="font-bold text-xl text-purple">
  {name}
  {#await missing}
    <strong>(...)</strong>
  {:then ok}
    {#if ok}
      <strong class="text-green-700">(installed)</strong>
    {:else} 
      <strong class="text-red-700">(MISSING)</strong>
    {/if}
  {:catch}
    <strong class="text-red-700">(MISSING)</strong>
  {/await}
</h3>
