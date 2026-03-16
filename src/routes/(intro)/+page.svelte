<script lang='ts'>
  import { resolve } from "$app/paths";
  import { electron } from "$lib/electron";
  import LogoFull from "$lib/components/logo/LogoFull.svelte";
  import BigThrobber from "$lib/components/throbber/BigThrobber.svelte";
  import MissingDependenciesInfo from "./MissingDependenciesInfo.svelte";
  import { fade } from "svelte/transition";

  async function testCheckAPI() {
    return await electron.ytdlp.hasYTDLP();
  }

  async function sleep() {
    return new Promise(resolve => {
      setTimeout(() => {
        // resolve(Math.round(Math.random()) === 1)
        resolve(false);
      }, 1000);
    });
  }

</script>

<div class="relative">
  {#await sleep()}
    <div class="w-full h-full absolute min-h-screen px-8 py-24 grid place-items-center">
      <div out:fade|global={{ duration: 200 }} class="h-full grid place-items-center">
        <div class="max-w-150 grid justify-items-center content-center gap-y-4">
          <LogoFull/>
          <BigThrobber/>
        </div>
      </div>
    </div>
  {:then ok}
    {#if !ok}
      <div class="w-full absolute min-h-screen px-8 py-16 grid place-items-center">
        <div in:fade|global={{ duration: 500, delay: 200 }} class="h-full grid place-items-center">
          <div class="max-w-150 grid justify-items-center content-center gap-y-4">
            <MissingDependenciesInfo/>
          </div>
        </div>
      </div>
    {/if}
  {/await}
</div>
