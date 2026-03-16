<script lang="ts">
  import type { DependencyInfo } from "./DependencyInfo";
    import MissingDependencyHeader from "./MissingDependencyHeader.svelte";

  const {
      src, name, description, missing
  }: DependencyInfo = $props();


</script>

{#snippet contents(ok: boolean = true)}
    {#if src}
      <img src={src} alt={name} class="max-w-20 object-contain">
    {/if}
    <div>
      {#if ok}
        <MissingDependencyHeader {name} {missing}/>
      {:else}
        <MissingDependencyHeader 
          {name} 
          missing={missing}/>
        <strong class="text-red-700 text-bold" >Something went wrong while checking for this dependency</strong>
      {/if}
      <p class="text-base">{@html description}</p>
    </div>
{/snippet}

{#await missing}
  <div class="flex gap-x-4 p-4 border border-grey-1 rounded-lg">
    {@render contents()}
  </div>
{:then ok}
  {#if ok}
    <div class="flex gap-x-4 p-4 border border-grey-1 rounded-lg">
      {@render contents()}
    </div>
  {:else}
    <div class="flex gap-x-4 p-4 border-2 border-red-700 rounded-lg">
      {@render contents()}
    </div>
  {/if}
{:catch}
  <div class="flex gap-x-4 p-4 border-2 border-red-700 rounded-lg">
    {@render contents(false)}
  </div>
{/await}
