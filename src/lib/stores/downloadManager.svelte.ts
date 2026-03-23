import type { DownloadingVideoDownloadContext, VideoDownloadContext } from "$lib/downloadsModel"
import { electron } from "$lib/electron"
import type { DeepReadonly } from "$lib/utils"
import { onMount } from "svelte"
import type { DownloadOptionsWithCookies, VideoDownloadContextWithoutId } from "$lib/types/window"
import { mockVideo } from "$lib/mock/mockVideoMetadata"
import { globalPersistentStore } from "./globalPersistentStore.svelte"

interface DownloadManagerState {
  outputDirectory: string

  queue: VideoDownloadContext[]
  completedQueue: DownloadingVideoDownloadContext[]
  currentDownload: DownloadingVideoDownloadContext | null
  consumingFromQueue: boolean
}

const defaultSessionState: DownloadManagerState = {
  outputDirectory: "/home/nebby/Documents/",
  queue: [{
    ...mockVideo,
  }],
  completedQueue: [],
  currentDownload: null,
  consumingFromQueue: false,
}

class DownloadManager {
  #state = $state<DownloadManagerState>(defaultSessionState);
  #currId = 0
  // TODO: This is highly coupled to global persistent store...
  #cookies = $derived(globalPersistentStore.state.preferences.cookies)

  get state(): DeepReadonly<DownloadManagerState> {
    return this.#state
  }

  #nextId() {
    const next = this.#currId;
    this.#currId++
    return next;
  }

  async init() {
    // Don't await results, just assign the callbacks
    electron.ytdlp.setOnVideoDownloadRequestFinished(this.#onVideoDownloadRequestFinished);
    electron.ytdlp.setOnRequestNextVideo(() => {
      return this.#onRequestNextVideo();
    })
    this.setOutputPath(await electron.getDefaultOutputDirectory());
  }

  // Enqueue video with URL, can throw an error if invalid.
  async enqueueVideo(url: string, opts: Pick<DownloadOptionsWithCookies, "downloadFormat" | "embedThumbnail" | "embedMetadata" | "cookies">) {
    // TODO: Consider appending error to some sort of error manager
    const metadatas = await electron.ytdlp.getMetadata(url, {
      ...opts,
    });

    const videos: VideoDownloadContext[] = metadatas.map(metadata => {
      return {
        ...metadata,
        downloadId: this.#nextId(),
      }
    })

    this.#state.queue.push(...videos);
  }

  async removeQueuedVideo(downloadId: number) {
    if (!Number.isInteger(downloadId)) return

    // Remove video from queue
    const qRemoveIdx = this.#state.queue.findIndex(val => val.downloadId === downloadId);
    if (qRemoveIdx !== -1) {
      this.#state.queue.splice(qRemoveIdx, 1);
      return;
    }

    // TODO: Small race condition exists when cancelling a request that is almost complete
    await electron.ytdlp.cancelDownload();
  }

  clearQueue() {
    this.#state.queue = [];
  }

  queueEmpty() {
    return this.#state.queue.length === 0;
  }

  async startConsumingDownloadQueue() {
    if (this.#state.consumingFromQueue) return;

    this.#state.consumingFromQueue = true;
    this.#state.consumingFromQueue = await electron.ytdlp.startDownload();
  }

  async stopConsumingDownloadQueue() {
    if (!this.#state.consumingFromQueue) return;

    this.#state.consumingFromQueue = false;
    if (await electron.ytdlp.cancelDownload()) {
      this.#state.currentDownload = null;
    }
  }

  /**
   * Pops the next video from the front of the queue and sets the value of currentDownload to that video. This is called whenever YTDLP on electron main thread requires a new video, which can occur:
   *    - When a download is starting
   *    - When a download is cancelled
   *    - When a download has finished
  */
  #onRequestNextVideo = (): [VideoDownloadContextWithoutId | null, Pick<DownloadOptionsWithCookies, 'cookies' | 'outputDirectory'> | null] => {
    console.log("Main requested next video");
    if (!this.state.consumingFromQueue
        || this.state.queue.length === 0) {
      // No video available
      this.#state.consumingFromQueue = false;
      return [null, null] as const;
    }

    const [nextVideo] = this.#state.queue.splice(0,1);
    this.#state.currentDownload = {
      progress: 0,
      failed: false,
      error: "",
      ...nextVideo,
    };
    
    // TODO: This is highly coupled to global persistent store...
    return [$state.snapshot(nextVideo), {
      cookies: $state.snapshot(this.#cookies),
      outputDirectory: $state.snapshot(this.#state.outputDirectory)
    }];
  }

  #onVideoDownloadRequestFinished = () => {
    this.#state.currentDownload = null;
  }

  setOutputPath(path: string) {
    this.#state.outputDirectory = path;
  }
}

export const downloadManager = new DownloadManager();
