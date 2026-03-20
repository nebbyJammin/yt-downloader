// Override types on window object to expose API via IPC

import type { DownloadFormat, VideoDownloadContext } from "$lib/downloadsModel"
import type { CookiesPreferences, PersistentAppState } from "$lib/stores/globalPersistentStore.svelte"


// yt-dlp --cookies-from-browser firefox --skip-download --flat-playlist --extractor-args  youtubetab:approximate-date -O "url,title,channel,duration,timestamp,view_count" 'https://www.youtube.com/playlist?list=PLKLMsHwPzDZHB9n7mneI5vI5ZdKjiu02p'

export interface DownloadOptions {
  cookies: CookiesPreferences,
  downloadFormat: DownloadFormat,
}

export type VideoDownloadContextWithoutId = Omit<VideoDownloadContext, 'downloadId'>

export interface YTDLP {
  hasYTDLP: () => Promise<boolean>
  hasFFMPEG: () => Promise<boolean>
  hasJSRUNTIME: () => Promise<boolean>
  hasMinimumDependencies: () => Promise<boolean>

  getMetadata: (url: string, args: Pick<DownloadOptions, 'cookies'>) => Promise<VideoDownloadContextWithoutId>
  startDownload: () => Promise<VideoDownloadContextWithoutId>
  cancelDownload: () => Promise<boolean>
  /**
   * Set the callback function that requests the next video. This callback is called whenever: 
   *    - startDownload() is called
   *    - A download finished
   *    - cancelDownload() is called
   *
   * This callback should return the next video to be processed.
   * If no video should be processed, then the callback should return null.
   */
  setOnRequestNextVideo: (callback: () => VideoDownloadContextWithoutId | null) => Promise<void>
  /**
   * Set the callback function, which is called whenever a video has finished processing (downloading or has been cancelled).
  */
  setOnVideoDownloadRequestFinished: (callback: (() => any) | (() => void)) => Promise<void> // TODO: Pass the status of the video as an argument
}

export interface Store {
  load: () => Promise<PersistentAppState | null>
  save: (state: PersistentAppState) => Promise<boolean>
}

export interface NebbysYTDLP {
  ytdlp: YTDLP
  store: Store
  dialog: {
    showOpenDialog: () => Promise<string | null>
    openDirectoryInSeparateProcess: (path: string) => Promise<boolean>,
  }
  restart: () => Promise<void>,
  getDefaultOutputDirectory: () => Promise<string>,
}

declare global {
  interface Window {
    nebbysYTDLP: NebbysYTDLP
  }
}
