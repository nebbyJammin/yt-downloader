<script lang="ts">
  import { electron } from "$lib/electron";
  import type { DependencyInfo } from "./DependencyInfo";
  import MissingDependencyInfo from "./MissingDependencyInfo.svelte"

  const deps: DependencyInfo[] = [
    {
      name: "yt-dlp",
      src: "/images/yt-dlp.png",
      description: "This project requires a <strong>yt-dlp</strong> binary that must be accessible through system PATH. This binary is responsible for bypassing YouTube's antibot/scripting measures, and makes downloading YouTube videos possible.",
      missing: electron.ytdlp.hasYTDLP(),
    },
    {
      name: "FFMPEG",
      src: "/images/FFmpeg_Logo_new.svg",
      description: "This project requires <strong>ffmpeg</strong> and <strong>ffprobe</strong> binaries which must be accessible through system PATH. These binaries are required by <strong>yt-dlp</strong>.",
      missing: electron.ytdlp.hasFFMPEG(),
    },
    {
      name: "JavaScript Runtime",
      description: "This project requires one of the following runtimes: <strong>node.js</strong>, <strong>deno</strong>, <strong>QuickJS</strong>, <strong>bun</strong>. This is to bypass YouTube's JavaScript Challenges, which is required by <strong>yt-dlp</strong>.",
      missing: electron.ytdlp.hasJSRUNTIME(),
    }
  ]
</script>

<div class="flex flex-col gap-y-6">
  <h1 class="font-bold text-6xl text-purple">Oops!</h1>
  <h2 class="font-semibold text-2xl text-foreground">You're missing some dependencies...</h2>
  <div class="flex flex-col gap-y-3">
    {#each deps as props}
      <MissingDependencyInfo {...props}/>
    {/each}
  </div>
  <p>Install these dependencies, and ensure they are all accessible via your system PATH. Once you have installed the dependencies, restart <strong>yt-downloader</strong>.</p>
  <div class="flex justify-end">
    <button 
      class="rounded-lg bg-purple hover:bg-purple-1 active:bg-purple-2 py-3 px-6 text-lg font-extrabold transition-color duration-200 ease-out"
      onclick={()=>electron.restart()}
    >
      Restart
    </button>
  </div>
</div>
