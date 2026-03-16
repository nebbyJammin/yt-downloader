<script lang='ts'>
  import { electron } from "$lib/electron";
  import LogoFull from "$lib/components/logo/LogoFull.svelte";
  import BigThrobber from "$lib/components/throbber/BigThrobber.svelte";
  import MissingDependenciesInfo from "./MissingDependenciesInfo.svelte";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";

  const ANIMATION_FADE_IN_DURATION = 200;

  async function testCheckAPI() {
    const promises = await Promise.all([
      electron.ytdlp.hasMinimumDependencies(),
      new Promise(res => {
        setTimeout(() => {
          res(true);
        }, 1000)
      })
    ])

    const ok = promises[0];

    if (ok) {
      setTimeout(() => {
        goto('/home') 
      }, ANIMATION_FADE_IN_DURATION)
    }
    return ok;
  }

</script>

{#snippet MissingDependenciesLayout()}
  <div class="w-full absolute min-h-screen px-8 py-16 grid place-items-center">
    <div in:fade|global={{ duration: 500, delay: ANIMATION_FADE_IN_DURATION }} class="h-full grid place-items-center">
      <div class="max-w-150 grid justify-items-center content-center gap-y-4">
        <MissingDependenciesInfo/>
      </div>
    </div>
  </div> 
{/snippet}

<div class="relative">
  {#await testCheckAPI()}
    <div class="w-full h-full absolute min-h-screen px-8 py-24 grid place-items-center">
      <div out:fade|global={{ duration: ANIMATION_FADE_IN_DURATION }} class="h-full grid place-items-center">
        <div class="max-w-150 grid justify-items-center content-center gap-y-4">
          <LogoFull/>
          <BigThrobber/>
        </div>
      </div>
    </div>
  {:then ok}
    {#if !ok}
      {@render MissingDependenciesLayout()}
    {/if}
  {:catch}
    {@render MissingDependenciesLayout()}
  {/await}
</div>
