<script lang="ts" module>
  // Downloader
  let downloadDelay = $state(0);
  // TODO: Use a sensible output directory that isn't /
  let outputPath = $state<string | null>(null);
  outputPath = await electron.getDefaultOutputDirectory();

  // Per Request Settings
  let format = $state(FileFormat.MP3);
  let quality = 
    $state<
      MP3DownloadQuality 
    | MP4DownloadQuality
    >(MP3DownloadQuality.KBS320);
  let url = $state("");
  let embedThumbnail = $state(true);
  let embedMetadata = $state(true);
</script>

<script lang="ts">
  import StyledField from "$lib/components/form/StyledField.svelte";

  import { FileFormat, getReadableMP3DownloadQuality, getReadableMP4DownloadQuality, MP3DownloadQuality, MP4DownloadQuality } from "$lib/downloadsModel";
  import { electron } from "$lib/electron";
  import { onMount } from "svelte";

  const FileFormatReadable = {
    [FileFormat.MP3]: "mp3",
    [FileFormat.MP4]: "mp4",
  }

  function filterEnum(entries: [string, string | any][]) {
    return entries.filter(([_, code]) => Number.isInteger(code)) as [string, number][];
  }
  const FILE_FORMATS = filterEnum(Object.entries(FileFormat))
  const MP3_QUALITIES = filterEnum(Object.entries(MP3DownloadQuality));
  const MP4_QUALITIES = filterEnum(Object.entries(MP4DownloadQuality));

  async function selectOutputOnClick() {
    const path = await electron.dialog.showOpenDialog();
    if (path) {
      outputPath = path;
    }
  }

  async function openOutputDirectory() {
    if (outputPath === null) return;

    await electron.dialog.openDirectoryInSeparateProcess(outputPath);
  }

  const DEFAULT_MP3_QUALITY = MP3DownloadQuality.KBS320;
  const DEFAULT_MP4_QUALITY = MP4DownloadQuality.P1080;
  let isFirstEffect = true;
  onMount(() => {
    // Apply default quality whenever the file format changes
    $effect(() => {
      const f = format; // depend on format

      if (isFirstEffect) {
        isFirstEffect = false;
        return;
      } else {
        switch (f) {
          case FileFormat.MP3:
            quality = DEFAULT_MP3_QUALITY;
            break
          case FileFormat.MP4:
            quality = DEFAULT_MP4_QUALITY;
            break
        }
      }
    })
  })

  const [minDelay, maxDelay] = [0, 120]
  function downloadDelayBlur(e: FocusEvent | KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    target.valueAsNumber = Math.min(Math.max(target.valueAsNumber, minDelay), maxDelay);
  }

</script>

{#snippet downloaderSettings()}
  <div>
    <h2 class="font-semibold text-white text-xl my-5">Downloader Settings</h2>

    <div class="flex flex-row flex-wrap gap-y-2">
      <div class="w-full">
        <StyledField label="Output Directory">
          <div class="flex gap-x-2 gap-y-2 flex-wrap w-full">
            <div class="fake-field flex flex-row gap-x-4 items-center min-w-80">
              <div class="grow overflow-hidden whitespace-nowrap text-ellipsis">{outputPath}</div>
              <button 
                class="basis-1 grow-0 shrink-0 hover:bg-grey-1/20 active:bg-grey-1/30 -m-1 p-2 size-[calc(100%+8px)] aspect-square rounded-lg transition-[background] duration-200 ease-out"
                onclick={selectOutputOnClick}
                aria-labelledby="select file"
              >
                <div 
                  class="mask-[url(/images/icons/folder.svg)] bg-purple cursor-pointer size-full bg-no-repeat"
                ></div>
              </button>
            </div>
            <button
              class="interactable-purple disabled:bg-grey-1 text-foreground rounded-lg px-5 py-3 font-bold whitespace-nowrap"
              onclick={openOutputDirectory}
              disabled={outputPath === null}
            >
              Open in Explorer
            </button>
          </div>
        </StyledField>

      </div>

      <StyledField label="Delay (s)">
        <input 
          id="download-delay-input" 
          type="number" min="0" max="120" 
          bind:value={downloadDelay} 
          onblur={downloadDelayBlur} 
          onkeydown={downloadDelayBlur}

          class="max-w-20"
        >
      </StyledField>
    </div>
  </div>  
{/snippet}

{#snippet requestSettings()}
  <div class="rounded-xl outline outline-grey-1 flex flex-col gap-y-4">
    <h2 class="font-semibold text-foreground text-xl">Add to Queue</h2>
    <div class="flex flex-wrap gap-2">
      <div class="w-full basis-full">
        <StyledField label="Enter a Video/URL Playlist">
          <input 
            type="url" 
            bind:value={url} 
            placeholder="https://www.youtube.com/watch?v=cq8WquQioXY"
            class="placeholder:text-grey-1/30"
          >
        </StyledField>
      </div>
      <StyledField label="Format">
        <select name="format" id="format" bind:value={format}>
          {#each FILE_FORMATS as [readable, code]}
            <option value={code}>{readable}</option> 
          {/each}
        </select>
      </StyledField>

      <!-- Show other options based on file format -->
      {#if format === FileFormat.MP3}
        <StyledField label="Quality">
          <select name="quality" id="quality" bind:value={quality}>
          {#each MP3_QUALITIES as [readable, code]}
            <option value={code}>{getReadableMP3DownloadQuality(code)}</option> 
          {/each}
          </select>
        </StyledField>
      {:else if format === FileFormat.MP4}
        <StyledField label="quality">
          <select name="quality" id="quality" bind:value={quality}>
          {#each MP4_QUALITIES as [readable, code]}
            <option value={code}>{getReadableMP4DownloadQuality(code)}</option> 
          {/each}
          </select>
        </StyledField>
      {/if}

      <div class="flex flex-wrap basis-full gap-x-4 justify-baseline">
        <StyledField>
          <div class="flex h-full place-items-center gap-x-2">
            <label for="embed-thumbnail">Embed Thumbnail:</label>
            <input id="embed-thumbnail" type="checkbox" class="size-6" bind:checked={embedThumbnail}>
          </div>
        </StyledField>

        <StyledField>
          <div class="flex h-full place-items-center gap-x-2">
            <label for="embed-thumbnail">Embed Metadata:</label>
            <input id="embed-metadata" type="checkbox" class="size-6" bind:checked={embedMetadata}>
          </div>
        </StyledField>
      </div>
      <div class="basis-full flex justify-end my-3">
        <button
          class="interactable-purple rounded-lg px-6 py-3 font-bold"
          onclick={() => {
            console.log("Adding to queue");
          }}
        >Add to Queue</button>
      </div>
    </div>
  </div>  
{/snippet}

<!-- DOWNLOADER -->

<h1 class="font-bold text-white text-5xl">Download Queue</h1>
<div class="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
  <div class="settings-container py-10 flex flex-col *:px-8 *:py-6">
    {@render downloaderSettings()}
    {@render requestSettings()}
  </div>
  <div class="bg-red-200/10 min-h-100">
    {#each [outputPath, downloadDelay, format, quality, url, embedThumbnail, embedMetadata] as val}
      <div>{val ?? "null"}</div> 
    {/each}
  </div>
</div>
