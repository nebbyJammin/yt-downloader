<script lang="ts">
  import { FileFormat, getReadableMP3DownloadQuality, getReadableMP4DownloadQuality, MP3DownloadQuality, type DownloadingVideoDownloadContext, type VideoDownloadContext } from "$lib/downloadsModel";
  import type { Component, Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  interface VideoPreviewArgs {
    metadata: VideoDownloadContext
    Badge?: Component<VideoDownloadContext> | Component<DownloadingVideoDownloadContext>
  }

  let {
    metadata,
    Badge,
    ...props
  }: VideoPreviewArgs = $props();

  let readableDuration = $derived.by(() => {
    const totalSeconds = metadata.duration;
    const seconds = Math.floor(totalSeconds % 60); // Probably don't need to floor here
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor((totalSeconds / 3600) % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`
    } else {
      return `${minutes}:${pad(seconds)}`
    }
  })

  let readableViewCount = $derived.by(() => {
    if (metadata.view_count < 1000) {
      return `${metadata.view_count} views`
    } else if (metadata.view_count < 1000000) {
      return `${Math.round(metadata.view_count / 100)/10}K views`
    } else if (metadata.view_count < 1000000000) {
      return `${Math.round(metadata.view_count / 100000)/10}M views`
    } else {
      return `${Math.round(metadata.view_count / 100000000)/10}B views`
    }
  })

  let date = $derived(new Date(metadata.timestamp*1000));
  let readableDate = $derived.by(() => {
    const month = date.toLocaleString('default', { month: 'long'});
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
  })

  let readableDateDelta = $derived.by(() => {
    const now = new Date();
    const deltaMs = now.getTime()-date.getTime();
    const diffInSecs = Math.floor(deltaMs / 1000);
    const diffInMinutes = Math.floor(diffInSecs / 60);
    if (diffInMinutes === 0) {
      return diffInSecs === 1 ? `${diffInSecs} second ago` : `${diffInSecs} seconds ago`
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 0) {
      return diffInMinutes === 1 ? `${diffInMinutes} minute ago` : `${diffInMinutes} minutes ago`
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 0) {
      return diffInHours === 1 ? `${diffInHours} hour ago` : `${diffInHours} hours ago`
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 0) {
      return diffInDays === 1 ? `${diffInDays} day ago` : `${diffInDays} days ago`
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 0) {
      return diffInWeeks === 1 ? `${diffInWeeks} week ago` : `${diffInWeeks} weeks ago`
    }
    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInYears === 0) {
      return diffInMonths === 1 ? `${diffInMonths} month ago` : `${diffInMonths} months ago`
    }
    return diffInYears === 1 ? `${diffInYears} year ago` : `${diffInYears} years ago`
  })

  let [readableFormat, readableQuality] = $derived.by(() => {
    const formatDetails = metadata.downloadFormat
    if (formatDetails.format === FileFormat.MP3) {
      return ["MP3", getReadableMP3DownloadQuality(formatDetails.quality)];
    } else if (formatDetails.format === FileFormat.MP4) {
      return ["MP4", getReadableMP4DownloadQuality(formatDetails.quality)];
    }

    return [null, null]
  })

  let hasDownloadInstructions = $derived(
    readableFormat !== null
    && readableQuality !== null
  );

</script>

{#snippet chip(content: string)}
  <span class="px-1 py-1 outline outline-blue content-center text-[10px]">{content}</span>
  
{/snippet}

<div 
  class="hover:bg-grey-1/20 hover:shadow-lg hover:shadow-black/60 px-5 py-1 transition-colors duration-200 ease-out cursor-grab active:cursor-grabbing **:select-none" 
  draggable="false"
  transition:fade={{duration: 125, easing: cubicOut}}
>
  <div class="grid grid-cols-[50px_min(250px,20cqw)_minmax(0,1fr)] overflow-x-hidden gap-x-4 overflow-hidden">
    <div class="w-full grid place-content-center">
      {#if Badge}
        <Badge {...metadata}/>
      {/if}
    </div>
    <div class="relative w-full aspect-video">
      <img 
        src={metadata.thumbnail} alt="{metadata.thumbnail}"
        class="absolute inset-0 object-contain rounded-lg shadow-black/30 shadow-md w-full"
        draggable={false}
      > 
      <div 
        class="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md text-xs font-bold select-none pointer-events-none shadow-black/30 shadow-md"
        draggable="false"
      >{readableDuration}</div>
    </div> 
    <div class="flex flex-col gap-y-1 py-2">
      <h2 class="font-bold line-clamp-2">{metadata.title}</h2>
      <h3 class="text-xs text-grey-1">{metadata.channel}</h3>
      <div class="text-xs text-grey-1 whitespace-nowrap text-ellipsis overflow-hidden">
        {readableViewCount} • {readableDate} ({readableDateDelta})
      </div>
      {#if hasDownloadInstructions}
        <div class="grow flex items-end">
          <div class="*:text-blue text-xs font-bold text-grey-1 flex flex-wrap gap-x-1 gap-y-1 justify-self-end">
            {@render chip(readableFormat!)}
            {@render chip(readableQuality!)}
            {#if metadata.embedMetadata}
              {@render chip("Embed Metadata")}
            {/if}
            {#if metadata.embedMetadata}
              {@render chip("Embed Thumbnail")}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
