import type { VideoDownloadContext } from "$lib/downloadsModel"
import { electron } from "$lib/electron"
import type { DeepReadonly } from "$lib/utils"
import { onMount } from "svelte"
import { globalPersistentStore } from "./globalPersistentStore.svelte"

interface DownloadManagerState {
  queue: VideoDownloadContext[]
  completedQueue: VideoDownloadContext[]
  currentDownload: VideoDownloadContext | null
  consumingFromQueue: boolean
}

const defaultSessionState: DownloadManagerState = {
  queue: [],
  completedQueue: [],
  currentDownload: null,
  consumingFromQueue: false,
}

class DownloadManager {
  #state = $state<DownloadManagerState>(defaultSessionState);
  #currId = 0

  get state(): DeepReadonly<DownloadManagerState> {
    return this.#state
  }

  #nextId() {
    const next = this.#currId;
    this.#currId++
    return next;
  }

  init() {
    onMount(async () => {
      // Don't await results, just assign the callbacks
      electron.ytdlp.setOnVideoDownloadRequestFinished(this.#onVideoDownloadRequestFinished);
      electron.ytdlp.setOnRequestNextVideo(this.#onRequestNextVideo)
    })
  }

  // Enqueue video with URL, can throw an error if invalid.
  async enqueueVideo(url: string) {
    // TODO: Consider appending error to some sort of error manager
    const metadata = await electron.ytdlp.getMetadata(url, {
      cookies: globalPersistentStore.state.preferences.cookies,
    });

    this.#state.queue.push({...metadata, downloadId: this.#nextId()});
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

  startConsumingDownloadQueue() {
    if (this.#state.consumingFromQueue) return;

    this.#state.consumingFromQueue = true;
    electron.ytdlp.startDownload()
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
  #onRequestNextVideo = () => {
    if (!this.state.consumingFromQueue) return null;
    if (this.state.queue.length == 0) return null

    const [nextVideo] = this.#state.queue.splice(0,1);
    this.#state.currentDownload = nextVideo;
    
    return nextVideo
  }

  #onVideoDownloadRequestFinished = () => {
    this.#state.currentDownload = null;
  }
}

export const downloadManager = new DownloadManager();
