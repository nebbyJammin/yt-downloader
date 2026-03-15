<script lang='ts'>
  import { resolve } from "$app/paths";
  import { electron } from "$lib/electron";

  async function testCheckAPI() {
    return await electron.ytdlp.hasYTDLP();
  }

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p><a href={resolve("/second")}>Go to the second route</a></p>

{#await testCheckAPI()}
<p>Checking API</p>
{:then res} 
{res}
{/await}
